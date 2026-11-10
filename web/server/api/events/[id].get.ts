import { cmsGet } from '../../utils/cms'

/** All photos of one event, for the photo viewer. */
export default defineCachedEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') || ''
  if (!/^[a-z0-9]+$/i.test(id)) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  const r: any = await cmsGet(`/events/${id}`, { populate: ['photos'] })
  if (!r?.data) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  return { title: r.data.title, photos: mapEventPhotos(r.data) }
}, { maxAge: 60, swr: true, name: 'event', getKey: (e) => getRouterParam(e, 'id') || '' })
