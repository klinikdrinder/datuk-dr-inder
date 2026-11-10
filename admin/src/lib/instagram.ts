/**
 * Instagram API with Instagram Login (professional accounts).
 * Docs: https://developers.facebook.com/docs/instagram-platform
 */
import type { Payload } from 'payload'

const BASE = 'https://graph.instagram.com'
const VERSION = process.env.IG_API_VERSION ? `/${process.env.IG_API_VERSION}` : ''
const DAY = 24 * 3600 * 1000

async function igGet(path: string, params: Record<string, string>) {
  const url = new URL(`${BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
  const body: any = await res.json().catch(() => ({}))
  if (!res.ok || body.error) throw new Error(body.error ? `${body.error.type || 'Error'}: ${body.error.message}` : `HTTP ${res.status}`)
  return body
}

const settings = (payload: Payload) => payload.findGlobal({ slug: 'instagram-settings', overrideAccess: true, depth: 0 }) as Promise<any>
const saveStatus = (payload: Payload, data: Record<string, any>) =>
  payload.updateGlobal({ slug: 'instagram-settings', data, overrideAccess: true, context: { skipSync: true } })

/** Pull the latest posts and upsert them. Pinned/hidden flags set in the admin are kept. */
export async function syncInstagram(payload: Payload) {
  const s = await settings(payload)
  if (!s?.access_token) return { skipped: 'no token' }
  try {
    const data = await igGet(`${VERSION}/me/media`, {
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp', limit: '40', access_token: s.access_token,
    })
    let count = 0
    for (const m of data.data || []) {
      const values = {
        caption: (m.caption || '').slice(0, 2000), media_type: m.media_type, media_url: m.media_url || null,
        thumbnail_url: m.thumbnail_url || null, permalink: m.permalink, posted_at: m.timestamp,
      }
      const found = await payload.find({ collection: 'instagram-posts', where: { ig_id: { equals: m.id } }, limit: 1, overrideAccess: true, depth: 0 })
      if (found.docs[0]) await payload.update({ collection: 'instagram-posts', id: found.docs[0].id, data: values, overrideAccess: true })
      else await payload.create({ collection: 'instagram-posts', data: { ig_id: m.id, pinned: false, hidden: false, ...values }, overrideAccess: true })
      count++
    }
    // keep the table small: drop unpinned posts beyond the newest 60
    const old = await payload.find({ collection: 'instagram-posts', where: { pinned: { not_equals: true } }, sort: '-posted_at', page: 2, limit: 60, overrideAccess: true, depth: 0 })
    if (old.docs.length) await payload.delete({ collection: 'instagram-posts', where: { id: { in: old.docs.map((d: any) => d.id) } }, overrideAccess: true })

    let username = s.account_username
    if (!username) {
      try { username = (await igGet(`${VERSION}/me`, { fields: 'username', access_token: s.access_token })).username } catch {}
    }
    await saveStatus(payload, { last_synced_at: new Date().toISOString(), last_status: `OK: ${count} posts synced`, account_username: username || null })
    return { ok: true, count }
  } catch (e: any) {
    payload.logger.error(`[instagram] sync failed: ${e.message}`)
    await saveStatus(payload, { last_status: `Sync failed: ${e.message}`.slice(0, 1000) })
    return { ok: false, error: e.message }
  }
}

/** Long-lived tokens last 60 days; renew when less than 20 days remain. */
export async function refreshInstagramToken(payload: Payload, force = false) {
  const s = await settings(payload)
  if (!s?.access_token) return { skipped: 'no token' }
  const expires = s.token_expires_at ? new Date(s.token_expires_at).getTime() : 0
  if (!force && expires && expires - Date.now() > 20 * DAY) return { skipped: 'not due' }
  try {
    const r = await igGet('/refresh_access_token', { grant_type: 'ig_refresh_token', access_token: s.access_token })
    await saveStatus(payload, {
      access_token: r.access_token,
      token_expires_at: new Date(Date.now() + (r.expires_in || 60 * 86400) * 1000).toISOString(),
      last_status: 'Token renewed',
    })
    return { ok: true }
  } catch (e: any) {
    payload.logger.error(`[instagram] token refresh failed: ${e.message}`)
    await saveStatus(payload, { last_status: `Token renewal failed: ${e.message}. Paste a new token.`.slice(0, 1000) })
    return { ok: false, error: e.message }
  }
}
