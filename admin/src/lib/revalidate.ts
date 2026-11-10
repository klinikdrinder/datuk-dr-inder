/**
 * Tells the website to rebuild its cached pages right after something is saved, so changes
 * show up within seconds instead of waiting for the cache to expire.
 */
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, Payload } from 'payload'

export async function revalidateWebsite(paths: string[] = [], payload?: Payload) {
  const url = process.env.WEBSITE_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!url || !secret) return
  const all = [...new Set(['/', ...paths])]
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/api/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ paths: all }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) payload?.logger.warn(`[revalidate] website answered ${res.status}`)
  } catch (e: any) {
    payload?.logger.warn(`[revalidate] website not reached: ${e.message}`)
  }
}

/** Which website pages show this item (besides the homepage). */
async function pagesFor(collection: string, doc: any, payload: Payload): Promise<string[]> {
  switch (collection) {
    case 'articles':
      return ['/journal', ...(doc?.slug ? [`/journal/${doc.slug}`] : [])]
    case 'categories':
      return ['/journal']
    case 'seminars':
      return ['/seminars', ...(doc?.slug ? [`/seminars/${doc.slug}`] : [])]
    case 'events': {
      const out = ['/events']
      const s = doc?.seminar
      const id = s && typeof s === 'object' ? s.id : s
      if (id) {
        try {
          const sem: any = await payload.findByID({ collection: 'seminars', id, depth: 0, overrideAccess: true })
          if (sem?.slug) out.push(`/seminars/${sem.slug}`)
        } catch {}
      }
      return out
    }
    default:
      return []
  }
}

/** Drafts don't show on the website, so saving one needs no refresh (unless it was live before). */
const affectsSite = (doc: any, previousDoc?: any) =>
  !('_status' in (doc || {})) || doc._status === 'published' || previousDoc?._status === 'published'

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, collection, req, context }) => {
  if (context?.skipRevalidate || !affectsSite(doc, previousDoc)) return doc
  const paths = await pagesFor(collection.slug, doc, req.payload)
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) paths.push(...(await pagesFor(collection.slug, previousDoc, req.payload)))
  await revalidateWebsite(paths, req.payload)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, collection, req, context }) => {
  if (context?.skipRevalidate) return doc
  await revalidateWebsite(await pagesFor(collection.slug, doc, req.payload), req.payload)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, req, context }) => {
  if (!context?.skipRevalidate) await revalidateWebsite(['/events', '/seminars', '/journal'], req.payload)
  return doc
}
