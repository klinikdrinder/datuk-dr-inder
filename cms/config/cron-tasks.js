'use strict';
/**
 * Background jobs (run inside the CMS):
 *  - every 5 min: publish articles/seminars whose "Publish at" time has passed
 *  - every hour: pull the latest Instagram posts
 *  - daily 03:15: renew the Instagram token before it expires
 */
module.exports = {
  scheduledPublish: {
    task: async ({ strapi }) => {
      await require('../src/utils/scheduled-publish')(strapi);
    },
    options: { rule: '*/5 * * * *' },
  },
  instagramSync: {
    task: async ({ strapi }) => {
      await strapi.service('api::instagram-setting.instagram-setting').sync();
    },
    options: { rule: '7 * * * *' },
  },
  instagramRefresh: {
    task: async ({ strapi }) => {
      await strapi.service('api::instagram-setting.instagram-setting').refreshToken();
    },
    options: { rule: '15 3 * * *', tz: 'Asia/Kuala_Lumpur' },
  },
};
