/**
 * Routes used by the website server (Vercel) and by Vercel Cron.
 *  - POST /api/website/enquiry, /api/website/register — protected by the shared FORM_SECRET header
 *  - GET  /api/website/instagram — visible posts (public)
 *  - GET  /api/exports/enquiries|registrations?key=EXPORT_KEY — Excel (CSV) downloads
 *  - GET  /api/cron/* — background jobs, protected by CRON_SECRET (Vercel sends it automatically)
 *  - POST /api/setup/import — one-time content import, only while SETUP_SECRET is set
 */
import crypto from 'crypto'
import type { Endpoint, Payload, PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from 'payload'
import { refreshInstagramToken, syncInstagram } from '../lib/instagram'
import { revalidateWebsite } from '../lib/revalidate'

const json = (body: any, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers })
const fail = (status: number, message: string) => json({ error: { status, message } }, status)

function same(expected: string | undefined, given: string | null | undefined, min = 16) {
  const e = expected || ''
  const g = given || ''
  if (e.length < min) return false
  const a = Buffer.from(e), b = Buffer.from(g)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
const q = (req: PayloadRequest, k: string) => new URL(req.url || 'http://x').searchParams.get(k) || ''

const clean = (v: any, max = 500) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '')
const cleanText = (v: any, max = 3000) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max) : '')
const isEmail = (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
const isPhone = (v: string) => /^[+()\d\s-]{7,20}$/.test(v)
const myt = (d?: string | null) => (d ? new Date(d).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' }) : '')

async function body(req: PayloadRequest) {
  try { return (await req.json?.()) || {} } catch { return {} }
}

/** Email alert to the clinic. Silent if email is not configured. */
async function notify(payload: Payload, subject: string, lines: (string | false | null | undefined)[]) {
  try {
    if (!process.env.SMTP_HOST) return
    const s: any = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true, depth: 0 })
    const to = s?.notify_email || process.env.NOTIFY_EMAIL
    if (!to) return
    await payload.sendEmail({ to, subject, text: lines.filter(Boolean).join('\n') })
  } catch (e: any) {
    payload.logger.warn(`[notify] email not sent: ${e.message}`)
  }
}

const csvCell = (v: any) => {
  const s = v === null || v === undefined ? '' : String(v)
  const safe = /^[=@\t\r]|^[+\-](?![\d\s()])/.test(s) ? `'${s}` : s // stop formulas running in Excel, keep phone numbers readable
  return `"${safe.replace(/"/g, '""')}"`
}
const toCsv = (rows: any[], cols: [string, (r: any) => any][]) =>
  '﻿' + [cols.map((c) => csvCell(c[0])).join(',')].concat(rows.map((r) => cols.map((c) => csvCell(c[1](r))).join(','))).join('\r\n')
const csv = (text: string, name: string) =>
  new Response(text, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"` } })

/** Publishes drafts whose "Publish at" time has passed (articles and seminars). */
async function scheduledPublish(payload: Payload) {
  const now = new Date().toISOString()
  const done: string[] = []
  for (const collection of ['articles', 'seminars'] as const) {
    const due = await payload.find({
      collection, draft: true, overrideAccess: true, depth: 0, limit: 50,
      where: { and: [{ publish_at: { less_than_equal: now } }, { _status: { equals: 'draft' } }] },
    })
    for (const doc of due.docs as any[]) {
      const { id, createdAt, updatedAt, _status, ...rest } = doc
      await payload.update({ collection, id, draft: false, overrideAccess: true, data: { ...rest, _status: 'published', publish_at: null } })
      // (the collection hook refreshes the website pages)
      done.push(`${collection}:${id}`)
    }
  }
  return done
}

const cronOk = (req: PayloadRequest) => same(process.env.CRON_SECRET, (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''))

export const endpoints: Endpoint[] = [
  {
    path: '/website/enquiry',
    method: 'post',
    handler: async (req) => {
      if (!same(process.env.FORM_SECRET, req.headers.get('x-form-secret'))) return fail(403, 'Not allowed')
      const b: any = await body(req)
      const data = {
        name: clean(b.name, 120), phone: clean(b.phone, 30), email: clean(b.email, 160).toLowerCase() || null,
        country: clean(b.country, 80), interest: clean(b.interest, 120), message: cleanText(b.message, 2000),
        consent: b.consent === true, status: 'new' as const, source: clean(b.source, 60) || 'website',
      }
      if (!data.name || (!data.phone && !data.email)) return fail(400, 'Please add your name and a phone number or email.')
      if (data.phone && !isPhone(data.phone)) return fail(400, 'Please check the phone number.')
      if (!isEmail(data.email || '')) return fail(400, 'Please check the email address.')
      await req.payload.create({ collection: 'enquiries', data, overrideAccess: true })
      await notify(req.payload, `New enquiry: ${data.name} (${data.interest || 'consultation'})`, [
        `Name: ${data.name}`, `Phone: ${data.phone}`, `Email: ${data.email || ''}`, `Country: ${data.country}`,
        `Interested in: ${data.interest}`, data.message && `Message: ${data.message}`, '', 'Open the admin → Enquiries to follow up.',
      ])
      return json({ ok: true })
    },
  },
  {
    path: '/website/register',
    method: 'post',
    handler: async (req) => {
      if (!same(process.env.FORM_SECRET, req.headers.get('x-form-secret'))) return fail(403, 'Not allowed')
      const b: any = await body(req)
      const slug = clean(b.seminar, 200)
      const found = await req.payload.find({ collection: 'seminars', where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }, limit: 1, depth: 0, overrideAccess: true })
      const seminar: any = found.docs[0]
      if (!seminar) return fail(404, 'Seminar not found.')
      if (seminar.registration_mode !== 'form') return fail(400, 'Registration for this seminar is not taken on this form.')
      if (new Date(seminar.starts_at) < new Date()) return fail(400, 'This seminar has already taken place.')
      const data = {
        name: clean(b.name, 120), phone: clean(b.phone, 30), email: clean(b.email, 160).toLowerCase() || null,
        seats: Math.min(10, Math.max(1, parseInt(b.seats, 10) || 1)), notes: cleanText(b.notes, 1000),
        consent: b.consent === true, status: 'registered' as const, seminar: seminar.id,
      }
      if (!data.name || !data.phone) return fail(400, 'Please add your name and phone number.')
      if (!isPhone(data.phone)) return fail(400, 'Please check the phone number.')
      if (!isEmail(data.email || '')) return fail(400, 'Please check the email address.')
      if (seminar.capacity) {
        const regs = await req.payload.find({
          collection: 'seminar-registrations', limit: 10000, depth: 0, overrideAccess: true,
          where: { and: [{ seminar: { equals: seminar.id } }, { status: { not_equals: 'cancelled' } }] },
        })
        const taken = regs.docs.reduce((n: number, r: any) => n + (r.seats || 1), 0)
        if (taken + data.seats > seminar.capacity) return fail(400, 'Sorry, this seminar is full.')
      }
      await req.payload.create({ collection: 'seminar-registrations', data, overrideAccess: true })
      await notify(req.payload, `Seminar registration: ${seminar.title}`, [
        `Seminar: ${seminar.title} (${myt(seminar.starts_at)})`, `Name: ${data.name}`, `Phone: ${data.phone}`,
        `Email: ${data.email || ''}`, `Seats: ${data.seats}`, data.notes && `Notes: ${data.notes}`,
      ])
      return json({ ok: true })
    },
  },
  {
    path: '/website/instagram',
    method: 'get',
    handler: async (req) => {
      const s: any = await req.payload.findGlobal({ slug: 'instagram-settings', overrideAccess: true, depth: 0 })
      const r = await req.payload.find({
        collection: 'instagram-posts', where: { hidden: { not_equals: true } }, sort: ['-pinned', '-posted_at'],
        limit: s?.posts_to_show || 8, depth: 0, overrideAccess: true,
      })
      const posts = r.docs.map((p: any) => ({
        ig_id: p.ig_id, caption: p.caption, media_type: p.media_type, media_url: p.media_url,
        thumbnail_url: p.thumbnail_url, permalink: p.permalink, posted_at: p.posted_at, pinned: p.pinned,
      }))
      return json({ username: s?.account_username || null, posts }, 200, { 'Cache-Control': 'public, max-age=300' })
    },
  },
  {
    path: '/exports/registrations',
    method: 'get',
    handler: async (req) => {
      if (!same(process.env.EXPORT_KEY, q(req, 'key'))) return fail(403, 'Not allowed')
      const slug = q(req, 'seminar')
      const where: any = slug ? { 'seminar.slug': { equals: slug } } : {}
      const r = await req.payload.find({ collection: 'seminar-registrations', where, sort: 'createdAt', limit: 20000, depth: 1, overrideAccess: true })
      return csv(toCsv(r.docs, [
        ['Registered (MYT)', (x) => myt(x.createdAt)], ['Seminar', (x) => x.seminar?.title], ['Seminar date', (x) => myt(x.seminar?.starts_at)],
        ['Name', (x) => x.name], ['Phone', (x) => x.phone], ['Email', (x) => x.email], ['Seats', (x) => x.seats],
        ['Status', (x) => x.status], ['Notes', (x) => x.notes],
      ]), `registrations-${slug || 'all'}.csv`)
    },
  },
  {
    path: '/exports/enquiries',
    method: 'get',
    handler: async (req) => {
      if (!same(process.env.EXPORT_KEY, q(req, 'key'))) return fail(403, 'Not allowed')
      const r = await req.payload.find({ collection: 'enquiries', sort: '-createdAt', limit: 20000, depth: 0, overrideAccess: true })
      return csv(toCsv(r.docs, [
        ['Received (MYT)', (x) => myt(x.createdAt)], ['Name', (x) => x.name], ['Phone', (x) => x.phone], ['Email', (x) => x.email],
        ['Country', (x) => x.country], ['Interested in', (x) => x.interest], ['Message', (x) => x.message], ['Status', (x) => x.status],
      ]), 'enquiries.csv')
    },
  },
  {
    path: '/cron/publish',
    method: 'get',
    handler: async (req) => (cronOk(req) ? json({ published: await scheduledPublish(req.payload) }) : fail(401, 'Not allowed')),
  },
  {
    path: '/cron/instagram',
    method: 'get',
    handler: async (req) => {
      if (!cronOk(req)) return fail(401, 'Not allowed')
      const r: any = await syncInstagram(req.payload)
      if (r?.ok) await revalidateWebsite([], req.payload)
      return json(r)
    },
  },
  {
    path: '/cron/instagram-token',
    method: 'get',
    handler: async (req) => (cronOk(req) ? json(await refreshInstagramToken(req.payload)) : fail(401, 'Not allowed')),
  },
  {
    // Maintenance: rebuild the resized copies of existing photos (e.g. after changing sizes/format).
    // GET /api/maintenance/resize?page=1  (Authorization: Bearer CRON_SECRET), 5 photos per call.
    path: '/maintenance/resize',
    method: 'get',
    handler: async (req) => {
      if (!cronOk(req)) return fail(401, 'Not allowed')
      const page = Math.max(1, parseInt(q(req, 'page') || '1', 10) || 1)
      const r = await req.payload.find({
        collection: 'media', page, limit: 5, sort: 'id', depth: 0, overrideAccess: true,
        where: { mimeType: { in: ['image/jpeg', 'image/png', 'image/webp'] } },
      })
      const done: any[] = []
      for (const m of r.docs as any[]) {
        try {
          const src = /^https?:/.test(m.url) ? m.url : `${new URL(req.url || 'http://x').origin}${m.url}`
          const res = await fetch(src, { signal: AbortSignal.timeout(30000) })
          if (!res.ok) throw new Error(`download ${res.status}`)
          const data = Buffer.from(await res.arrayBuffer())
          await req.payload.update({
            collection: 'media', id: m.id, overrideAccess: true, overwriteExistingFiles: true, context: { skipRevalidate: true },
            data: {}, file: { data, mimetype: m.mimeType, name: m.filename, size: data.length },
          })
          done.push(m.id)
        } catch (e: any) {
          done.push({ id: m.id, error: e.message })
        }
      }
      return json({ page, totalPages: r.totalPages, done })
    },
  },
  {
    // One-time copy of content from the old admin. Disabled unless SETUP_SECRET is set (remove it afterwards).
    path: '/setup/import',
    method: 'post',
    handler: async (req) => {
      if (!same(process.env.SETUP_SECRET, req.headers.get('x-setup-secret'), 24)) return fail(403, 'Not allowed')
      const isUpload = (req.headers.get('content-type') || '').includes('multipart/form-data')
      if (isUpload) {
        await addDataAndFileToRequest(req)
        if (!req.file) return fail(400, 'No file')
        const meta: any = req.data || {}
        const doc = await req.payload.create({
          collection: 'media', overrideAccess: true, file: req.file,
          data: { alt: meta.alt || '', caption: meta.caption || '' },
        })
        return json({ id: doc.id, url: (doc as any).url })
      }
      const b: any = await body(req)
      const p = req.payload
      if (b.op === 'global') {
        const doc = await p.updateGlobal({ slug: b.slug, data: b.data, overrideAccess: true })
        return json({ ok: true, id: (doc as any).id })
      }
      if (b.op === 'create') {
        const doc = await p.create({ collection: b.collection, data: b.data, draft: b.draft === true, overrideAccess: true })
        return json({ id: doc.id })
      }
      if (b.op === 'count') {
        const r = await p.count({ collection: b.collection, overrideAccess: true })
        return json(r)
      }
      return fail(400, 'Unknown op')
    },
  },
]
