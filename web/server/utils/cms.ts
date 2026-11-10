import defaults from '../../shared/defaults.json'
import qs from 'qs'

export { defaults }

/*
 * The admin is Payload CMS. The website code was written against the old (Strapi) API, so this file
 * translates: Strapi-style queries go in, Payload REST is called, and the answer comes back in the
 * Strapi shape ({ data, meta }, media with `formats`, rich text as blocks). Mappers and pages stay as they are.
 */

const GLOBALS: Record<string, string> = { '/site-setting': 'site-settings', '/home-content': 'home-content' }
const OPS: Record<string, string> = {
  $eq: 'equals', $ne: 'not_equals', $lt: 'less_than', $lte: 'less_than_equal', $gt: 'greater_than', $gte: 'greater_than_equal',
  $in: 'in', $notIn: 'not_in', $contains: 'like', $null: 'exists', $notNull: 'exists',
}

/** { seminar: { slug: { $eq: 'x' } } } -> { 'seminar.slug': { equals: 'x' } } */
function where(filters: any, prefix = ''): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(filters || {})) {
    if (OPS[k]) {
      const op = OPS[k]!
      out[prefix] = { ...(out[prefix] || {}), [op]: k === '$null' ? !v : k === '$notNull' ? !!v : v }
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, where(v, prefix ? `${prefix}.${k}` : k))
    } else {
      out[prefix ? `${prefix}.${k}` : k] = { equals: v }
    }
  }
  return out
}

function payloadQuery(query: Record<string, any>) {
  const p: Record<string, any> = { depth: 1 }
  if (query.filters) p.where = where(query.filters)
  if (query.sort) {
    p.sort = [].concat(query.sort).map((s: string) => {
      const [f, dir] = String(s).split(':')
      return dir === 'desc' ? `-${f}` : f
    }).join(',')
  }
  if (query.pagination) {
    if (query.pagination.page) p.page = query.pagination.page
    if (query.pagination.pageSize) p.limit = query.pagination.pageSize
  }
  if (query.fields) p.select = Object.fromEntries([].concat(query.fields).map((f: string) => [f, true]))
  return p
}

// ---------- Payload -> Strapi shapes ----------
const isMedia = (o: any) => o && typeof o === 'object' && 'mimeType' in o && 'filename' in o
function toMedia(m: any) {
  const formats: Record<string, any> = {}
  for (const [k, s] of Object.entries<any>(m.sizes || {})) if (s?.url) formats[k] = { url: s.url, width: s.width, height: s.height }
  return { id: m.id, url: m.url, alternativeText: m.alt || '', caption: m.caption || '', mime: m.mimeType, width: m.width, height: m.height, formats }
}

const FMT: [number, string][] = [[1, 'bold'], [2, 'italic'], [4, 'strikethrough'], [8, 'underline'], [16, 'code']]
function lexInline(n: any): any[] {
  if (n.type === 'text') {
    const t: any = { type: 'text', text: n.text || '' }
    for (const [bit, name] of FMT) if ((n.format || 0) & bit) t[name] = true
    return [t]
  }
  if (n.type === 'linebreak') return [{ type: 'text', text: '\n' }]
  if (n.type === 'link' || n.type === 'autolink') return [{ type: 'link', url: n.fields?.url || n.url || '', children: (n.children || []).flatMap(lexInline) }]
  return (n.children || []).flatMap(lexInline)
}
function lexBlock(n: any): any {
  const kids = () => (n.children || []).flatMap(lexInline)
  switch (n.type) {
    case 'heading': return { type: 'heading', level: Number(String(n.tag || 'h2').slice(1)) || 2, children: kids() }
    case 'quote': return { type: 'quote', children: kids() }
    case 'list': return {
      type: 'list', format: n.listType === 'number' ? 'ordered' : 'unordered',
      children: (n.children || []).map((li: any) => ({
        type: 'list-item', children: (li.children || []).flatMap((c: any) => (c.type === 'list' ? [lexBlock(c)] : lexInline(c))),
      })),
    }
    case 'upload': return isMedia(n.value) ? { type: 'image', image: toMedia(n.value) } : null
    default: return { type: 'paragraph', children: kids() }
  }
}
const isLexical = (o: any) => o && typeof o === 'object' && o.root && Array.isArray(o.root.children)
const toBlocks = (o: any) => o.root.children.map(lexBlock).filter(Boolean)

function norm(v: any): any {
  if (Array.isArray(v)) return v.map(norm)
  if (!v || typeof v !== 'object') return v
  if (isMedia(v)) return toMedia(v)
  if (isLexical(v)) return toBlocks(v)
  const out: any = {}
  for (const [k, x] of Object.entries(v)) out[k] = norm(x)
  if ('id' in out && !('documentId' in out)) out.documentId = String(out.id)
  return out
}

/** GET from the CMS. Returns null instead of throwing, so the site still renders if the CMS is down. */
export async function cmsGet<T = any>(path: string, query: Record<string, any> = {}): Promise<T | null> {
  const { cmsUrl } = useRuntimeConfig()
  const g = GLOBALS[path]
  const url = g ? `/api/globals/${g}` : `/api${path}`
  const q = qs.stringify(g ? { depth: 1 } : payloadQuery(query), { encodeValuesOnly: true })
  try {
    const r: any = await $fetch(`${url}${q ? `?${q}` : ''}`, { baseURL: cmsUrl, timeout: 8000, retry: 1 })
    if (path.startsWith('/website/')) return r
    if (Array.isArray(r?.docs)) {
      return {
        data: r.docs.map(norm),
        meta: { pagination: { page: r.page, pageSize: r.limit, pageCount: r.totalPages, total: r.totalDocs } },
      } as T
    }
    return { data: norm(r) } as T
  } catch (e: any) {
    console.warn(`[cms] GET ${path} failed: ${e?.message || e}`)
    return null
  }
}

export async function cmsPost(path: string, body: any) {
  const { cmsUrl, formSecret } = useRuntimeConfig()
  return await $fetch(`/api${path}`, {
    baseURL: cmsUrl,
    method: 'POST',
    body,
    headers: { 'x-form-secret': formSecret },
    timeout: 12000,
  })
}

/** Turn a media object into { url, alt, caption, width, height } with an absolute URL. */
export function media(m: any, size: 'large' | 'medium' | 'small' | 'xlarge' | null = null) {
  if (!m || typeof m !== 'object' || !m.url) return null
  const { mediaUrl, cmsUrl } = { ...useRuntimeConfig().public, cmsUrl: useRuntimeConfig().cmsUrl }
  const base = (mediaUrl || cmsUrl || '').replace(/\/$/, '')
  const f = size && m.formats && m.formats[size] ? m.formats[size] : m
  const url = /^https?:/.test(f.url) ? f.url : `${base}${f.url}`
  const full = /^https?:/.test(m.url) ? m.url : `${base}${m.url}`
  return { url, full, alt: m.alternativeText || '', caption: m.caption || '', width: f.width || null, height: f.height || null, mime: m.mime || '' }
}

export const list = (r: any) => (r && Array.isArray(r.data) ? r.data : [])
