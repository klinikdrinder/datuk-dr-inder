'use strict';
/**
 * Instagram API with Instagram Login (professional accounts).
 * Docs: https://developers.facebook.com/docs/instagram-platform
 */
const { factories } = require('@strapi/strapi');

const UID = 'api::instagram-setting.instagram-setting';
const POST = 'api::instagram-post.instagram-post';
const BASE = 'https://graph.instagram.com';
const VERSION = process.env.IG_API_VERSION ? `/${process.env.IG_API_VERSION}` : '';
const DAY = 24 * 3600 * 1000;

async function igGet(path, params) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const msg = body.error ? `${body.error.type || 'Error'}: ${body.error.message}` : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

module.exports = factories.createCoreService(UID, ({ strapi }) => ({
  async getSettings() {
    return strapi.db.query(UID).findOne({ where: {} });
  },

  async saveStatus(patch) {
    const row = await this.getSettings();
    if (row) await strapi.db.query(UID).update({ where: { id: row.id }, data: patch });
  },

  /** Pull the latest posts and upsert them. Pinned/hidden flags set in the admin are kept. */
  async sync() {
    const s = await this.getSettings();
    if (!s || !s.access_token) return { skipped: 'no token' };
    try {
      const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
      const data = await igGet(`${VERSION}/me/media`, { fields, limit: 40, access_token: s.access_token });
      let count = 0;
      for (const m of data.data || []) {
        const values = {
          caption: (m.caption || '').slice(0, 2000),
          media_type: m.media_type,
          media_url: m.media_url || null,
          thumbnail_url: m.thumbnail_url || null,
          permalink: m.permalink,
          posted_at: m.timestamp,
        };
        const existing = await strapi.db.query(POST).findOne({ where: { ig_id: m.id } });
        if (existing) await strapi.db.query(POST).update({ where: { id: existing.id }, data: values });
        else await strapi.db.query(POST).create({ data: { ig_id: m.id, pinned: false, hidden: false, ...values } });
        count++;
      }
      // keep the table small: drop unpinned posts beyond the newest 60
      const old = await strapi.db.query(POST).findMany({ where: { pinned: false }, orderBy: { posted_at: 'desc' }, offset: 60, limit: 500, select: ['id'] });
      if (old.length) await strapi.db.query(POST).deleteMany({ where: { id: { $in: old.map((o) => o.id) } } });

      let username = s.account_username;
      if (!username) {
        try { username = (await igGet(`${VERSION}/me`, { fields: 'username', access_token: s.access_token })).username; } catch (_) {}
      }
      await this.saveStatus({ last_synced_at: new Date(), last_status: `OK: ${count} posts synced`, account_username: username || null });
      return { ok: true, count };
    } catch (e) {
      strapi.log.error(`[instagram] sync failed: ${e.message}`);
      await this.saveStatus({ last_status: `Sync failed: ${e.message}`.slice(0, 1000) });
      return { ok: false, error: e.message };
    }
  },

  /** Long-lived tokens last 60 days; renew when less than 20 days remain (token must be at least 24h old). */
  async refreshToken(force = false) {
    const s = await this.getSettings();
    if (!s || !s.access_token) return { skipped: 'no token' };
    const expires = s.token_expires_at ? new Date(s.token_expires_at).getTime() : 0;
    if (!force && expires && expires - Date.now() > 20 * DAY) return { skipped: 'not due' };
    try {
      const r = await igGet('/refresh_access_token', { grant_type: 'ig_refresh_token', access_token: s.access_token });
      await strapi.db.query(UID).update({
        where: { id: s.id },
        data: { access_token: r.access_token, token_expires_at: new Date(Date.now() + (r.expires_in || 60 * 86400) * 1000), last_status: 'Token renewed' },
      });
      return { ok: true };
    } catch (e) {
      strapi.log.error(`[instagram] token refresh failed: ${e.message}`);
      await this.saveStatus({ last_status: `Token renewal failed: ${e.message}. Paste a new token.`.slice(0, 1000) });
      return { ok: false, error: e.message };
    }
  },
}));
