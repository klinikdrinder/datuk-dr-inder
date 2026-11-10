import { cmsGet, list } from '../../utils/cms'

/** Every published event, newest first, as cards (cover photo + count) with the counters. */
export default defineCachedEventHandler(async () => {
  const r = await cmsGet('/events', {
    populate: { photos: true, seminar: { fields: ['slug', 'title'] } },
    sort: ['date:desc', 'id:desc'], pagination: { pageSize: 300 },
  })
  const rows = list(r)
  return { events: rows.map(mapEventCard), stats: eventStats(rows) }
}, { maxAge: 60, swr: true, name: 'events' })
