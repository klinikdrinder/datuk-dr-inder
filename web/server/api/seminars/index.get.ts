import { cmsGet, list } from '../../utils/cms'

export default defineCachedEventHandler(async () => {
  const now = new Date().toISOString()
  const [up, past] = await Promise.all([
    cmsGet('/seminars', { populate: ['poster'], filters: { starts_at: { $gte: now } }, sort: ['starts_at:asc'], pagination: { pageSize: 50 } }),
    cmsGet('/seminars', { populate: ['poster'], filters: { starts_at: { $lt: now } }, sort: ['starts_at:desc'], pagination: { pageSize: 50 } }),
  ])
  return { upcoming: list(up).map(mapSeminar), past: list(past).map(mapSeminar) }
}, { maxAge: 60, swr: true, name: 'seminars' })
