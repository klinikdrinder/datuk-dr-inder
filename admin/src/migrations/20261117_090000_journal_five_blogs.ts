import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import articles from './data/journal-five-blogs'

/**
 * One-time data load: the five Journal articles, saved as DRAFTS for Datuk's clinical review.
 * Nothing appears on the website until an editor opens each article and clicks Publish.
 * Skips any article whose slug already exists, so it is safe to run again.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const cat = await payload.find({ collection: 'categories', where: { slug: { equals: 'hair-restoration' } }, limit: 1, depth: 0, overrideAccess: true, req })
  const category = cat.docs[0]?.id
  for (const a of articles) {
    const found = await payload.find({ collection: 'articles', where: { slug: { equals: a.slug } }, limit: 1, depth: 0, draft: true, overrideAccess: true, req })
    if (found.totalDocs) continue
    await payload.create({
      collection: 'articles',
      draft: true,
      overrideAccess: true,
      req,
      context: { skipRevalidate: true },
      data: {
        title: a.title, slug: a.slug, excerpt: a.excerpt, body: a.body,
        seo_title: a.seo_title, seo_description: a.seo_description,
        ...(category ? { category } : {}),
        _status: 'draft',
      } as any,
    })
  }
}

/** Removes the five articles again, but only while they are still unpublished drafts. */
export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({
    collection: 'articles',
    where: { and: [{ slug: { in: articles.map((a) => a.slug) } }, { _status: { equals: 'draft' } }] },
    overrideAccess: true,
    req,
  })
}
