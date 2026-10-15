import { cmsGet, list } from '../../utils/cms'

export default defineCachedEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const r = await cmsGet('/articles', { populate: ['cover', 'category'], filters: { slug: { $eq: slug } }, pagination: { pageSize: 1 } })
  const a = list(r)[0]
  if (!a) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  const more = await cmsGet('/articles', { populate: ['cover', 'category'], filters: { slug: { $ne: slug } }, sort: ['publishedAt:desc'], pagination: { pageSize: 3 } })
  return { article: mapArticle(a), more: list(more).map(mapArticle) }
}, { maxAge: 120, swr: true, name: 'article', getKey: (e) => getRouterParam(e, 'slug') || '' })
