import { cmsPost } from '../utils/cms'

export default defineEventHandler(async (event) => {
  rateLimit(event)
  const body = await readBody(event)
  rejectSpam(body)
  try {
    await cmsPost('/website/enquiry', {
      name: body.name, phone: body.phone, email: body.email, country: body.country,
      interest: body.interest, message: body.message, consent: body.consent === true, source: 'datukdrinder.com',
    })
    return { ok: true }
  } catch (e: any) { cmsError(e) }
})
