'use strict';
const crypto = require('crypto');
const { checkSecret, clean, cleanText, isEmail, isPhone } = require('../../../utils/form-guard');
const notify = require('../../../utils/notify');

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  const safe = /^[=@\t\r]|^[+\-](?![\d\s()])/.test(s) ? `'${s}` : s; // stop formulas running in Excel, keep phone numbers readable
  return `"${safe.replace(/"/g, '""')}"`;
};
const toCsv = (rows, cols) => '﻿' + [cols.map((c) => csvCell(c[0])).join(',')]
  .concat(rows.map((r) => cols.map((c) => csvCell(c[1](r))).join(','))).join('\r\n');

function checkExportKey(ctx) {
  const expected = process.env.EXPORT_KEY || '';
  const given = String(ctx.query.key || '');
  if (expected.length < 16) return false;
  const a = Buffer.from(expected), b = Buffer.from(given);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const myt = (d) => (d ? new Date(d).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' }) : '');

module.exports = {
  async enquiry(ctx) {
    if (!checkSecret(ctx)) return ctx.forbidden('Not allowed');
    const b = ctx.request.body || {};
    const data = {
      name: clean(b.name, 120), phone: clean(b.phone, 30), email: clean(b.email, 160).toLowerCase() || null,
      country: clean(b.country, 80), interest: clean(b.interest, 120), message: cleanText(b.message, 2000),
      consent: b.consent === true, status: 'new', source: clean(b.source, 60) || 'website',
    };
    if (!data.name || (!data.phone && !data.email)) return ctx.badRequest('Please add your name and a phone number or email.');
    if (data.phone && !isPhone(data.phone)) return ctx.badRequest('Please check the phone number.');
    if (!isEmail(data.email)) return ctx.badRequest('Please check the email address.');
    await strapi.documents('api::enquiry.enquiry').create({ data });
    notify(strapi, `New enquiry: ${data.name} (${data.interest || 'consultation'})`, [
      `Name: ${data.name}`, `Phone: ${data.phone}`, `Email: ${data.email}`, `Country: ${data.country}`,
      `Interested in: ${data.interest}`, data.message && `Message: ${data.message}`, '', 'Open the admin → Content Manager → Enquiry to follow up.',
    ]);
    ctx.body = { ok: true };
  },

  async register(ctx) {
    if (!checkSecret(ctx)) return ctx.forbidden('Not allowed');
    const b = ctx.request.body || {};
    const slug = clean(b.seminar, 200);
    const seminar = await strapi.documents('api::seminar.seminar').findFirst({
      status: 'published', filters: { slug }, fields: ['title', 'starts_at', 'capacity', 'registration_mode'],
    });
    if (!seminar) return ctx.notFound('Seminar not found.');
    if (seminar.registration_mode !== 'form') return ctx.badRequest('Registration for this seminar is not taken on this form.');
    if (new Date(seminar.starts_at) < new Date()) return ctx.badRequest('This seminar has already taken place.');
    const data = {
      name: clean(b.name, 120), phone: clean(b.phone, 30), email: clean(b.email, 160).toLowerCase() || null,
      seats: Math.min(10, Math.max(1, parseInt(b.seats, 10) || 1)), notes: cleanText(b.notes, 1000),
      consent: b.consent === true, status: 'registered', seminar: seminar.documentId,
    };
    if (!data.name || !data.phone) return ctx.badRequest('Please add your name and phone number.');
    if (!isPhone(data.phone)) return ctx.badRequest('Please check the phone number.');
    if (!isEmail(data.email)) return ctx.badRequest('Please check the email address.');
    if (seminar.capacity) {
      const regs = await strapi.documents('api::seminar-registration.seminar-registration').findMany({
        filters: { seminar: { documentId: seminar.documentId }, status: { $ne: 'cancelled' } }, fields: ['seats'], limit: 10000,
      });
      const taken = regs.reduce((n, r) => n + (r.seats || 1), 0);
      if (taken + data.seats > seminar.capacity) return ctx.badRequest('Sorry, this seminar is full.');
    }
    await strapi.documents('api::seminar-registration.seminar-registration').create({ data });
    notify(strapi, `Seminar registration: ${seminar.title}`, [
      `Seminar: ${seminar.title} (${myt(seminar.starts_at)})`, `Name: ${data.name}`, `Phone: ${data.phone}`,
      `Email: ${data.email}`, `Seats: ${data.seats}`, data.notes && `Notes: ${data.notes}`,
    ]);
    ctx.body = { ok: true };
  },

  /** Visible posts for the website: pinned first, then newest. */
  async instagram(ctx) {
    const s = await strapi.db.query('api::instagram-setting.instagram-setting').findOne({ where: {} });
    const limit = (s && s.posts_to_show) || 8;
    const posts = await strapi.db.query('api::instagram-post.instagram-post').findMany({
      where: { hidden: false },
      orderBy: [{ pinned: 'desc' }, { posted_at: 'desc' }],
      limit,
      select: ['ig_id', 'caption', 'media_type', 'media_url', 'thumbnail_url', 'permalink', 'posted_at', 'pinned'],
    });
    ctx.set('Cache-Control', 'public, max-age=300');
    ctx.body = { username: (s && s.account_username) || null, posts };
  },

  async exportRegistrations(ctx) {
    if (!checkExportKey(ctx)) return ctx.forbidden('Not allowed');
    const filters = {};
    if (ctx.query.seminar) filters.seminar = { slug: String(ctx.query.seminar) };
    const rows = await strapi.documents('api::seminar-registration.seminar-registration').findMany({
      filters, populate: { seminar: { fields: ['title', 'starts_at'] } }, sort: 'createdAt:asc', limit: 20000,
    });
    ctx.set('Content-Type', 'text/csv; charset=utf-8');
    ctx.set('Content-Disposition', `attachment; filename="registrations-${ctx.query.seminar || 'all'}.csv"`);
    ctx.body = toCsv(rows, [
      ['Registered (MYT)', (r) => myt(r.createdAt)], ['Seminar', (r) => r.seminar && r.seminar.title],
      ['Seminar date', (r) => r.seminar && myt(r.seminar.starts_at)], ['Name', (r) => r.name], ['Phone', (r) => r.phone],
      ['Email', (r) => r.email], ['Seats', (r) => r.seats], ['Status', (r) => r.status], ['Notes', (r) => r.notes],
    ]);
  },

  async exportEnquiries(ctx) {
    if (!checkExportKey(ctx)) return ctx.forbidden('Not allowed');
    const rows = await strapi.documents('api::enquiry.enquiry').findMany({ sort: 'createdAt:desc', limit: 20000 });
    ctx.set('Content-Type', 'text/csv; charset=utf-8');
    ctx.set('Content-Disposition', 'attachment; filename="enquiries.csv"');
    ctx.body = toCsv(rows, [
      ['Received (MYT)', (r) => myt(r.createdAt)], ['Name', (r) => r.name], ['Phone', (r) => r.phone], ['Email', (r) => r.email],
      ['Country', (r) => r.country], ['Interested in', (r) => r.interest], ['Message', (r) => r.message], ['Status', (r) => r.status],
    ]);
  },
};
