'use strict';
/** When staff paste a new token, set its expiry and sync straight away. */
module.exports = {
  async beforeUpdate(event) {
    const d = event.params.data || {};
    if (d.access_token && !d.token_expires_at) d.token_expires_at = new Date(Date.now() + 59 * 86400 * 1000);
  },
  async beforeCreate(event) {
    const d = event.params.data || {};
    if (d.access_token && !d.token_expires_at) d.token_expires_at = new Date(Date.now() + 59 * 86400 * 1000);
  },
  async afterUpdate(event) {
    if (event.params.data && event.params.data.access_token && !event.params.data.last_status) {
      setTimeout(() => strapi.service('api::instagram-setting.instagram-setting').sync().catch(() => {}), 1500);
    }
  },
  async afterCreate(event) {
    if (event.params.data && event.params.data.access_token) {
      setTimeout(() => strapi.service('api::instagram-setting.instagram-setting').sync().catch(() => {}), 1500);
    }
  },
};
