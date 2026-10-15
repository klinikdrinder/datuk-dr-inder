'use strict';
const crypto = require('crypto');

/** Only the website server (Vercel) knows FORM_SECRET; browsers never see it. */
function checkSecret(ctx) {
  const expected = process.env.FORM_SECRET || '';
  const given = ctx.request.get('x-form-secret') || '';
  if (!expected || expected.length < 16) return false;
  const a = Buffer.from(expected), b = Buffer.from(given);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const clean = (v, max = 500) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '');
const cleanText = (v, max = 3000) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max) : '');
const isEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = (v) => /^[+()\d\s-]{7,20}$/.test(v);

module.exports = { checkSecret, clean, cleanText, isEmail, isPhone };
