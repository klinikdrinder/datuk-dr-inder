import { cmsGet, list } from '../../utils/cms'

export default defineCachedEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const r = await cmsGet('/seminars', { populate: ['poster'], filters: { slug: { $eq: slug } }, pagination: { pageSize: 1 } })
  const s = list(r)[0]
  if (!s) throw createError({ statusCode: 404, statusMessage: 'Seminar not found' })
  // photos from any Event linked to this seminar
  const ev = await cmsGet('/events', { populate: ['photos'], filters: { seminar: { slug: { $eq: slug } } }, sort: ['date:asc'], pagination: { pageSize: 20 } })
  return { ...mapSeminar(s), photos: list(ev).flatMap(mapEventPhotos) }
}, { maxAge: 60, swr: true, name: 'seminar', getKey: (e) => getRouterParam(e, 'slug') || '' })
