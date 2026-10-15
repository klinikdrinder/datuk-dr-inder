/** Basic spam protection: hidden "website" field must stay empty and the form must take at least 3 seconds. */
export function rejectSpam(body: any) {
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Invalid form' })
  if (body.website) throw createError({ statusCode: 400, statusMessage: 'Invalid form' })
  const t = Number(body.t || 0)
  if (!t || Date.now() - t < 3000 || Date.now() - t > 24 * 3600 * 1000) {
    throw createError({ statusCode: 400, statusMessage: 'Please try again.' })
  }
}

const hits = new Map<string, number[]>()
/** Light per-IP limit (per server instance): 6 posts per 10 minutes. */
export function rateLimit(event: any) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'x'
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  if (arr.length >= 6) throw createError({ statusCode: 429, statusMessage: 'Too many submissions. Please try again later or WhatsApp us.' })
  arr.push(now); hits.set(ip, arr)
}

export function cmsError(e: any) {
  const msg = e?.data?.error?.message || e?.statusMessage || 'Something went wrong. Please WhatsApp us instead.'
  const code = e?.statusCode || e?.status || 500
  throw createError({ statusCode: code >= 400 && code < 500 ? code : 502, statusMessage: msg })
}
