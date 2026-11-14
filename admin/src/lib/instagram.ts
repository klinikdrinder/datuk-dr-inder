/**
 * Instagram feed for the website. Works with both kinds of token Meta hands out:
 *  - Instagram Login tokens ("IG…"): graph.instagram.com, 60 days, renewed here automatically
 *  - Facebook / Unified login tokens ("EAA…", e.g. a system-user token): graph.facebook.com,
 *    needs the Instagram account ID (found automatically when possible). System-user tokens never expire.
 * Docs: https://developers.facebook.com/docs/instagram-platform
 */
import type { Payload } from 'payload'
import { revalidateWebsite } from './revalidate'

const IG = 'https://graph.instagram.com'
const FB = `https://graph.facebook.com/${process.env.FB_API_VERSION || 'v23.0'}`
const IG_VERSION = process.env.IG_API_VERSION ? `/${process.env.IG_API_VERSION}` : ''
const DAY = 24 * 3600 * 1000
const FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'

/** Instagram Login tokens start with "IG"; everything else is a Facebook-issued token. */
export const isInstagramLoginToken = (t?: string | null) => /^IG/.test(String(t || '').trim())

async function get(base: string, path: string, params: Record<string, string>) {
  const url = new URL(`${base}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
  const body: any = await res.json().catch(() => ({}))
  if (!res.ok || body.error) throw new Error(body.error ? `${body.error.type || 'Error'}: ${body.error.message}` : `HTTP ${res.status}`)
  return body
}

const settings = (payload: Payload) => payload.findGlobal({ slug: 'instagram-settings', overrideAccess: true, depth: 0 }) as Promise<any>
const saveStatus = (payload: Payload, data: Record<string, any>) =>
  payload.updateGlobal({ slug: 'instagram-settings', data, overrideAccess: true, context: { skipSync: true } })

/** Find the Instagram professional account behind a Facebook-issued token. */
async function findInstagramId(token: string): Promise<{ id: string; username?: string } | null> {
  const tries: [string, Record<string, string>, (b: any) => any][] = [
    ['/me/accounts', { fields: 'instagram_business_account{id,username}', limit: '50' }, (b) => b.data?.find((p: any) => p.instagram_business_account)?.instagram_business_account],
    ['/me', { fields: 'instagram_business_account{id,username}' }, (b) => b.instagram_business_account],
    ['/me/instagram_accounts', { fields: 'id,username' }, (b) => b.data?.[0]],
  ]
  for (const [path, params, pick] of tries) {
    try {
      const hit = pick(await get(FB, path, { ...params, access_token: token }))
      if (hit?.id) return { id: String(hit.id), username: hit.username }
    } catch {}
  }
  return null
}

/** Pull the latest posts and upsert them. Pinned/hidden flags set in the admin are kept. */
export async function syncInstagram(payload: Payload) {
  const s = await settings(payload)
  const token = String(s?.access_token || '').trim()
  if (!token) return { skipped: 'no token' }
  try {
    let items: any[] = []
    let username = s.account_username
    let igId = String(s.instagram_user_id || '').trim()

    if (isInstagramLoginToken(token)) {
      items = (await get(IG, `${IG_VERSION}/me/media`, { fields: FIELDS, limit: '40', access_token: token })).data || []
      if (!username) {
        try { username = (await get(IG, `${IG_VERSION}/me`, { fields: 'username', access_token: token })).username } catch {}
      }
    } else {
      if (!igId) {
        const found = await findInstagramId(token)
        if (!found) throw new Error('Could not find the Instagram account for this token. Paste the Instagram account ID into "Instagram user ID" and save again.')
        igId = found.id
        username = username || found.username
      }
      items = (await get(FB, `/${igId}/media`, { fields: FIELDS, limit: '40', access_token: token })).data || []
      if (!username) {
        try { username = (await get(FB, `/${igId}`, { fields: 'username', access_token: token })).username } catch {}
      }
    }

    let count = 0
    for (const m of items) {
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

    await saveStatus(payload, {
      last_synced_at: new Date().toISOString(), last_status: `OK: ${count} posts synced`,
      account_username: username || null, ...(igId ? { instagram_user_id: igId } : {}),
    })
    await revalidateWebsite([], payload) // show the new posts on the homepage straight away
    return { ok: true, count }
  } catch (e: any) {
    payload.logger.error(`[instagram] sync failed: ${e.message}`)
    await saveStatus(payload, { last_status: `Sync failed: ${e.message}`.slice(0, 1000) })
    return { ok: false, error: e.message }
  }
}

/** Instagram Login tokens last 60 days; renew when less than 20 days remain. Facebook system-user tokens don't expire. */
export async function refreshInstagramToken(payload: Payload, force = false) {
  const s = await settings(payload)
  if (!s?.access_token) return { skipped: 'no token' }
  if (!isInstagramLoginToken(s.access_token)) return { skipped: 'token type does not need renewing' }
  const expires = s.token_expires_at ? new Date(s.token_expires_at).getTime() : 0
  if (!force && expires && expires - Date.now() > 20 * DAY) return { skipped: 'not due' }
  try {
    const r = await get(IG, '/refresh_access_token', { grant_type: 'ig_refresh_token', access_token: s.access_token })
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
