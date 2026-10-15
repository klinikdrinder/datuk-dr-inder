import { media } from './cms'

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
