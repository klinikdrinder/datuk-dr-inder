import { cmsGet, list } from '../utils/cms'

export default defineCachedEventHandler(async (event) => {
  const base = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const [arts, sems] = await Promise.all([
    cmsGet('/articles', { fields: ['slug', 'updatedAt'], pagination: { pageSize: 500 } }),
    cmsGet('/seminars', { fields: ['slug', 'updatedAt'], pagination: { pageSize: 500 } }),
  ])
  const urls = [
    { loc: `${base}/`, pri: '1.0' }, { loc: `${base}/journal`, pri: '0.8' }, { loc: `${base}/seminars`, pri: '0.8' },
    ...list(arts).map((a: any) => ({ loc: `${base}/journal/${a.slug}`, mod: a.updatedAt, pri: '0.7' })),
    ...list(sems).map((s: any) => ({ loc: `${base}/seminars/${s.slug}`, mod: s.updatedAt, pri: '0.6' })),
  ]
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) =>
    `  <url><loc>${u.loc}</loc>${u.mod ? `<lastmod>${new Date(u.mod).toISOString()}</lastmod>` : ''}<priority>${u.pri}</priority></url>`).join('\n')}\n</urlset>`
}, { maxAge: 3600, name: 'sitemap' })
