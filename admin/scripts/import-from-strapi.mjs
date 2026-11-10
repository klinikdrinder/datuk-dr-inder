/**
 * One-time copy of everything in the old Strapi admin (cms/.tmp/data.db + cms/public/uploads)
 * into the new Payload admin, through its /api/setup/import route.
 *
 *   ADMIN_URL=https://admin.example.com SETUP_SECRET=... node scripts/import-from-strapi.mjs
 *
 * Refuses to run if the target already has media (pass --force to ignore).
 */
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const CMS = path.resolve(here, '../../cms')
const ADMIN = (process.env.ADMIN_URL || 'http://localhost:3001').replace(/\/$/, '')
const SECRET = process.env.SETUP_SECRET || ''
const MAX_BYTES = 4 * 1024 * 1024 // Vercel request limit is 4.5 MB
if (!SECRET) throw new Error('Set SETUP_SECRET')

const db = new Database(path.join(CMS, '.tmp/data.db'), { readonly: true })
const all = (sql, ...a) => db.prepare(sql).all(...a)

async function call(body) {
  const r = await fetch(`${ADMIN}/api/setup/import`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-setup-secret': SECRET }, body: JSON.stringify(body),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${body.op} ${body.collection || body.slug}: ${r.status} ${JSON.stringify(j).slice(0, 400)}`)
  return j
}

// ---------- Strapi blocks -> Lexical ----------
const FMT = { bold: 1, italic: 2, strikethrough: 4, underline: 8, code: 16 }
const base = { format: '', indent: 0, version: 1, direction: 'ltr' }
function inline(n) {
  if (n.type === 'link') {
    return { ...base, type: 'link', version: 3, fields: { url: n.url, newTab: /^https?:/.test(n.url || ''), linkType: 'custom' }, children: (n.children || []).map(inline) }
  }
  const format = Object.entries(FMT).reduce((f, [k, v]) => (n[k] ? f | v : f), 0)
  return { type: 'text', text: n.text || '', format, detail: 0, mode: 'normal', style: '', version: 1 }
}
function block(b) {
  const kids = () => (b.children || []).map(inline)
  switch (b.type) {
    case 'heading': return { ...base, type: 'heading', tag: `h${Math.min(Math.max(b.level || 2, 1), 6)}`, children: kids() }
    case 'quote': return { ...base, type: 'quote', children: kids() }
    case 'list': return {
      ...base, type: 'list', listType: b.format === 'ordered' ? 'number' : 'bullet', tag: b.format === 'ordered' ? 'ol' : 'ul', start: 1,
      children: (b.children || []).map((li, i) => ({ ...base, type: 'listitem', value: i + 1, checked: undefined, children: (li.children || []).map((c) => (c.type === 'list' ? block(c) : inline(c))) })),
    }
    default: return { ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: kids() }
  }
}
const toLexical = (v) => {
  const arr = typeof v === 'string' ? JSON.parse(v) : v
  if (!Array.isArray(arr) || !arr.length) return null
  return { root: { ...base, type: 'root', children: arr.map(block) } }
}

// ---------- helpers ----------
const META = new Set(['id', 'document_id', 'created_at', 'updated_at', 'published_at', 'created_by_id', 'updated_by_id', 'locale'])
const fieldName = (col) => col.replace(/_(\d)/g, '$1') // chip_1_title -> chip1_title
const iso = (v) => (v === null || v === undefined || v === '' ? null : typeof v === 'number' ? new Date(v).toISOString() : v)
const schema = (api) => JSON.parse(fs.readFileSync(path.join(CMS, `src/api/${api}/content-types/${api}/schema.json`), 'utf8'))

/** Convert one Strapi row into Payload data using the Strapi schema for types. */
function rowData(api, row) {
  const attrs = schema(api).attributes
  const out = {}
  for (const [col, val] of Object.entries(row)) {
    if (META.has(col)) continue
    const name = fieldName(col)
    const a = attrs[name] || attrs[col]
    if (!a) continue
    if (val === null || val === undefined) continue
    if (a.type === 'blocks') { const l = toLexical(val); if (l) out[name] = l; continue }
    if (a.type === 'boolean') { out[name] = !!val; continue }
    if (a.type === 'datetime') { out[name] = iso(val); continue }
    if (a.type === 'uid' && name !== 'slug') continue
    out[name] = val
  }
  return out
}

// ---------- media ----------
const mediaMap = new Map() // strapi file id -> payload media id
async function uploadFiles() {
  const files = all('select * from files order by id')
  for (const f of files) {
    const src = path.join(CMS, 'public', f.url)
    if (!fs.existsSync(src)) { console.warn('  missing file', f.url); continue }
    let buf = fs.readFileSync(src)
    let name = f.name.replace(/\.[^.]+$/, '') + path.extname(f.url).toLowerCase()
    let mime = f.mime
    if (buf.length > MAX_BYTES && mime.startsWith('image/')) {
      buf = await sharp(buf).rotate().webp({ quality: 90 }).toBuffer()
      name = name.replace(/\.[^.]+$/, '.webp'); mime = 'image/webp'
    }
    const form = new FormData()
    form.append('file', new Blob([buf], { type: mime }), name)
    form.append('_payload', JSON.stringify({ alt: f.alternative_text || '', caption: f.caption || '' }))
    const r = await fetch(`${ADMIN}/api/setup/import`, { method: 'POST', headers: { 'x-setup-secret': SECRET }, body: form })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`upload ${f.name}: ${r.status} ${JSON.stringify(j).slice(0, 300)}`)
    mediaMap.set(f.id, j.id)
    console.log(`  media ${f.id} -> ${j.id}  ${name} (${Math.round(buf.length / 1024)} KB)`)
  }
}
/** Media fields of one Strapi row: { field: id | [ids] } */
function mediaFor(api, rowId) {
  const attrs = schema(api).attributes
  const rel = all('select * from files_related_mph where related_type = ? and related_id = ? order by field, "order"', `api::${api}.${api}`, rowId)
  const out = {}
  for (const r of rel) {
    const id = mediaMap.get(r.file_id)
    if (!id) continue
    if (attrs[r.field]?.multiple) (out[r.field] ||= []).push(id)
    else out[r.field] = id
  }
  return out
}

/** One row per document: the published row when there is one, else the draft. */
function documents(table) {
  const rows = all(`select * from ${table} order by id`)
  const byDoc = new Map()
  for (const r of rows) {
    const cur = byDoc.get(r.document_id)
    if (!cur || (r.published_at && !cur.published_at)) byDoc.set(r.document_id, r)
  }
  return [...byDoc.values()]
}

async function importCollection(api, table, collection, extra = () => ({}), { drafts = false } = {}) {
  const map = new Map()
  for (const row of documents(table)) {
    const data = { ...rowData(api, row), ...mediaFor(api, row.id), ...extra(row) }
    if (drafts) {
      data._status = row.published_at ? 'published' : 'draft'
      if (row.published_at) data.publishedAt = iso(row.published_at)
    }
    const r = await call({ op: 'create', collection, data, draft: drafts && !row.published_at })
    map.set(row.id, r.id)
  }
  console.log(`  ${collection}: ${map.size}`)
  return map
}
const link = (table, from, to) => {
  const m = new Map()
  try { for (const r of all(`select * from ${table}`)) m.set(r[from], r[to]) } catch {}
  return m
}

// ---------- run ----------
const existing = await call({ op: 'count', collection: 'media' })
if (existing.totalDocs > 0 && !process.argv.includes('--force')) {
  console.log(`Target already has ${existing.totalDocs} media items — nothing imported. Use --force to import anyway.`)
  process.exit(0)
}
console.log(`Importing into ${ADMIN}`)
console.log('Files…'); await uploadFiles()

console.log('Settings…')
const site = all('select * from site_settings')[0]
if (site) await call({ op: 'global', slug: 'site-settings', data: { ...rowData('site-setting', site), ...mediaFor('site-setting', site.id) } })
const home = all('select * from home_contents')[0]
if (home) await call({ op: 'global', slug: 'home-content', data: { ...rowData('home-content', home), ...mediaFor('home-content', home.id) } })

console.log('Collections…')
await importCollection('recognition-logo', 'recognition_logos', 'recognition-logos')
await importCollection('certificate', 'certificates', 'certificates')
await importCollection('award', 'awards', 'awards')
await importCollection('publication', 'publications', 'publications')
await importCollection('press-feature', 'press_features', 'press-features')
const cats = await importCollection('category', 'categories', 'categories')
const artCat = link('articles_category_lnk', 'article_id', 'category_id')
await importCollection('article', 'articles', 'articles', (r) => (artCat.get(r.id) ? { category: cats.get(artCat.get(r.id)) } : {}), { drafts: true })
const sems = await importCollection('seminar', 'seminars', 'seminars', () => ({}), { drafts: true })
const evSem = link('events_seminar_lnk', 'event_id', 'seminar_id')
const semByDoc = new Map(all('select id, document_id from seminars').map((r) => [r.id, r.document_id]))
const semIdForDoc = new Map(documents('seminars').map((r) => [r.document_id, sems.get(r.id)]))
await importCollection('event', 'events', 'events', (r) => {
  const s = evSem.get(r.id)
  return s ? { seminar: semIdForDoc.get(semByDoc.get(s)) } : {}
}, { drafts: true })
const regSem = link('seminar_registrations_seminar_lnk', 'seminar_registration_id', 'seminar_id')
await importCollection('seminar-registration', 'seminar_registrations', 'seminar-registrations', (r) => {
  const s = regSem.get(r.id)
  return s ? { seminar: semIdForDoc.get(semByDoc.get(s)) } : {}
})
await importCollection('enquiry', 'enquiries', 'enquiries')
console.log('Done.')
