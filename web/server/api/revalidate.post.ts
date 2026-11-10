import crypto from 'crypto'

/**
 * Called by the admin right after something is saved: rebuilds the cached (ISR) pages on Vercel
 * so changes show within seconds. Protected by REVALIDATE_SECRET (same value in the admin).
 */
const ALLOWED = /^\/(|events|seminars|journal|seminars\/[a-z0-9-]{1,140}|journal\/[a-z0-9-]{1,140})$/

function same(a: string, b: string) {
  if (a.length < 16) return false
  const x = Buffer.from(a), y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

export default defineEventHandler(async (event) => {
  const { revalidateSecret } = useRuntimeConfig()
  if (!same(revalidateSecret || '', getHeader(event, 'x-revalidate-secret') || '')) {
    throw createError({ statusCode: 403, statusMessage: 'Not allowed' })
  }
  const token = process.env.VERCEL_BYPASS_TOKEN
  const body = await readBody(event).catch(() => ({}))
  const paths = [...new Set(['/', ...((body?.paths as string[]) || [])])].filter((p) => typeof p === 'string' && ALLOWED.test(p)).slice(0, 20)
  if (!token) return { ok: false, reason: 'no bypass token (local dev?)', paths }

  // Rebuild each page on this deployment (Vercel on-demand ISR).
  const origin = getRequestURL(event).origin
  const results = await Promise.all(paths.map(async (p) => {
    try {
      const r = await fetch(`${origin}${p}`, { method: 'HEAD', headers: { 'x-prerender-revalidate': token }, signal: AbortSignal.timeout(12000) })
      return [p, r.status]
    } catch (e: any) {
      return [p, e.message]
    }
  }))
  return { ok: true, results: Object.fromEntries(results) }
})
