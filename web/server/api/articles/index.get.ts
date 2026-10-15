import { cmsGet, list } from '../../utils/cms'

export default defineCachedEventHandler(async (event) => {
  const q = getQuery(event)
  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1)
  const cat = String(q.category || '')
  const filters: any = {}
  if (cat) filters.category = { slug: { $eq: cat } }
  const [r, cats] = await Promise.all([
    cmsGet('/articles', { populate: ['cover', 'category'], filters, sort: ['publishedAt:desc'], pagination: { page, pageSize: 9 } }),
    cmsGet('/categories', { sort: ['name:asc'], pagination: { pageSize: 50 } }),
  ])
  return {
    articles: list(r).map(mapArticle),
    pagination: r?.meta?.pagination || { page: 1, pageCount: 1 },
    categories: list(cats).map((c: any) => ({ name: c.name, slug: c.slug })),
  }
}, { maxAge: 60, swr: true, name: 'articles', getKey: (e) => { const q = getQuery(e); return `${q.page || 1}-${q.category || ''}` } })
