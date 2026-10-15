import defaults from '../../shared/defaults.json'
import qs from 'qs'

export { defaults }

/** GET from the CMS. Returns null instead of throwing, so the site still renders if the CMS is down. */
export async function cmsGet<T = any>(path: string, query: Record<string, any> = {}): Promise<T | null> {
  const { cmsUrl } = useRuntimeConfig()
  try {
    const q = qs.stringify(query, { encodeValuesOnly: true, arrayFormat: 'indices' })
    return await $fetch<T>(`/api${path}${q ? `?${q}` : ''}`, {
      baseURL: cmsUrl,
      timeout: 8000,
      retry: 1,
    })
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

/** Turn a Strapi media object into { url, alt, caption, width, height } with an absolute URL. */
export function media(m: any, size: 'large' | 'medium' | 'small' | 'xlarge' | null = null) {
  if (!m) return null
  const { mediaUrl, cmsUrl } = { ...useRuntimeConfig().public, cmsUrl: useRuntimeConfig().cmsUrl }
  const base = (mediaUrl || cmsUrl || '').replace(/\/$/, '')
  const f = size && m.formats && m.formats[size] ? m.formats[size] : m
  const url = /^https?:/.test(f.url) ? f.url : `${base}${f.url}`
  const full = /^https?:/.test(m.url) ? m.url : `${base}${m.url}`
  return { url, full, alt: m.alternativeText || '', caption: m.caption || '', width: f.width || null, height: f.height || null, mime: m.mime || '' }
}

export const list = (r: any) => (r && Array.isArray(r.data) ? r.data : [])
