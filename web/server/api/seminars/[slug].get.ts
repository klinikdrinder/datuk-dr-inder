import { cmsGet, list } from '../../utils/cms'

export default defineCachedEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const r = await cmsGet('/seminars', { populate: ['poster'], filters: { slug: { $eq: slug } }, pagination: { pageSize: 1 } })
  const s = list(r)[0]
  if (!s) throw createError({ statusCode: 404, statusMessage: 'Seminar not found' })
  return mapSeminar(s)
}, { maxAge: 60, swr: true, name: 'seminar', getKey: (e) => getRouterParam(e, 'slug') || '' })
