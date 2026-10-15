import { cmsPost } from '../utils/cms'

export default defineEventHandler(async (event) => {
  rateLimit(event)
  const body = await readBody(event)
  rejectSpam(body)
  try {
    await cmsPost('/website/register', {
      seminar: body.seminar, name: body.name, phone: body.phone, email: body.email,
      seats: body.seats, notes: body.notes, consent: body.consent === true,
    })
    return { ok: true }
  } catch (e: any) { cmsError(e) }
})
