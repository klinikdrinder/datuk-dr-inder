import { media } from './cms'

/** Event as a card: cover photo (the first photo) and a count; the full photo set is fetched on click. */
export function mapEventCard(x: any) {
  const photos = Array.isArray(x.photos) ? x.photos : []
  const country = (x.country || '').trim()
  return {
    id: x.documentId, title: x.title, date: x.date, end_date: x.end_date, city: x.city || '', country,
    international: !!country && !/^malaysia$/i.test(country), role: x.role || '', highlight: x.highlight || '',
    summary: x.summary || '', cover: media(photos[0], 'large'), photo_count: photos.length,
    // up to 5 photos for the homepage collage (first one larger)
    preview: photos.slice(0, 5).map((m: any, i: number) => media(m, i === 0 ? 'large' : 'medium')),
    seminar: x.seminar?.slug ? { slug: x.seminar.slug, title: x.seminar.title } : null,
  }
}
export function mapEventPhotos(x: any) {
  return (Array.isArray(x?.photos) ? x.photos : []).map((m: any) => {
    const p = media(m, 'large')!
    return { ...p, caption: p.caption || x.title }
  })
}
/** Totals for the counters: every published event, distinct countries, events this calendar year (Malaysia time). */
export function eventStats(rows: any[]) {
  const year = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric' })
  const countries = new Set(rows.map((r) => (r.country || '').trim().toLowerCase()).filter(Boolean))
  const years = rows.map((r) => String(r.date || '').slice(0, 4)).filter(Boolean)
  return { total: rows.length, countries: countries.size, this_year: years.filter((y) => y === year).length, since: years.length ? years.sort()[0] : null }
}

export function mapSeminar(x: any) {
  return {
    title: x.title, slug: x.slug, starts_at: x.starts_at, ends_at: x.ends_at, venue: x.venue, is_online: x.is_online,
    summary: x.summary, description: x.description || [], poster: media(x.poster, 'large'), fee: x.fee,
    capacity: x.capacity, mode: x.registration_mode, external_url: x.external_url,
  }
}
export function mapArticle(x: any) {
  return {
    title: x.title, slug: x.slug, excerpt: x.excerpt, cover: media(x.cover, 'large'), body: x.body || [],
    category: x.category ? { name: x.category.name, slug: x.category.slug } : null,
    author: x.author_name, reviewed_by: x.reviewed_by, date: x.publishedAt, updated: x.updatedAt,
    minutes: x.reading_minutes, seo_title: x.seo_title, seo_description: x.seo_description,
  }
}
