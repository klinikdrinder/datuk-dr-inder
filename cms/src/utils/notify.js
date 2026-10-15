'use strict';
/** Sends an email alert to the clinic when someone submits a form. Silent if email is not configured. */
module.exports = async (strapi, subject, lines) => {
  try {
    if (!strapi.plugin('email') || !process.env.SMTP_HOST) return;
    const settings = await strapi.documents('api::site-setting.site-setting').findFirst({ fields: ['notify_email'] });
    const to = (settings && settings.notify_email) || process.env.NOTIFY_EMAIL;
    if (!to) return;
    const text = lines.filter(Boolean).join('\n');
    await strapi.plugin('email').service('email').send({ to, subject, text });
  } catch (e) {
    strapi.log.warn(`[notify] email not sent: ${e.message}`);
  }
};
