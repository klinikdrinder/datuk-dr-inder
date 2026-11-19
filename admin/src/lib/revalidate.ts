/**
 * Tells the website to rebuild its cached pages right after something is saved, so changes
 * show up within seconds instead of waiting for the cache to expire.
 */
import { after } from 'next/server'
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

/**
 * Run the refresh only once the save is finished. Hooks run inside the save's database
 * transaction, so refreshing straight away made the website rebuild from the *old* data
 * (and made staff wait for the rebuild). after() runs once the response is sent, i.e. after commit.
 */
function later(job: () => Promise<unknown>, payload: Payload) {
  const run = () => job().catch((e) => payload.logger.warn(`[revalidate] ${e?.message || e}`))
  try {
    after(run)
  } catch {
    setTimeout(run, 300) // not inside a web request (e.g. a script)
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
      return ['/events', ...(doc?.slug ? [`/seminars/${doc.slug}`] : [])]
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
    case 'media': // a replaced photo can appear on any page
      return ['/events', '/journal']
    default:
      return []
  }
}

/** Drafts don't show on the website, so saving one needs no refresh (unless it was live before). */
const affectsSite = (doc: any, previousDoc?: any) =>
  !('_status' in (doc || {})) || doc._status === 'published' || previousDoc?._status === 'published'

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, collection, req, context }) => {
  if (context?.skipRevalidate || !affectsSite(doc, previousDoc)) return doc
  const { payload } = req
  later(async () => {
    const paths = await pagesFor(collection.slug, doc, payload)
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) paths.push(...(await pagesFor(collection.slug, previousDoc, payload)))
    await revalidateWebsite(paths, payload)
  }, payload)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, collection, req, context }) => {
  if (context?.skipRevalidate) return doc
  const { payload } = req
  later(async () => revalidateWebsite(await pagesFor(collection.slug, doc, payload), payload), payload)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, req, context }) => {
  if (!context?.skipRevalidate) later(() => revalidateWebsite(['/events', '/journal'], req.payload), req.payload)
  return doc
}
