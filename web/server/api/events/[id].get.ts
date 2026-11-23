import { cmsGet, list } from '../../utils/cms'

/**
 * One event for its page: details + all photos, plus a few other events to browse next.
 * The address is /events/<id>-<title words>; only the leading number matters.
 */
export default defineEventHandler(async (event) => {
  const id = (getRouterParam(event, 'id') || '').match(/^\d+/)?.[0]
  if (!id) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  const [r, more]: any[] = await Promise.all([
    cmsGet(`/events/${id}`, { populate: ['photos'] }, { optional: true }),
    cmsGet('/events', { populate: ['photos'], filters: { id: { $ne: id } }, sort: ['date:desc', 'id:desc'], pagination: { pageSize: 3 } }, { optional: true }),
  ])
  if (!r?.data) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  return {
    ...mapEventCard(r.data),
    details: r.data.details || [],
    photos: mapEventPhotos(r.data),
    more: list(more).map(mapEventCard),
  }
})
