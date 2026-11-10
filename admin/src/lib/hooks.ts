import type { CollectionBeforeChangeHook, FieldHook } from 'payload'
import { APIError } from 'payload'
import { canPublish } from './access'

export const slugify = (s: string) =>
  String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120)

/** Fill the slug from the title when it is left empty. */
export const slugFromTitle = (source = 'title'): FieldHook => ({ value, data }) =>
  value ? slugify(value) : data?.[source] ? slugify(data[source]) : value

/**
 * Drafts: Authors may only save drafts (an Editor publishes).
 * Also records the first publish time in "publishedAt" (used for sorting on the website).
 */
export const draftRules: CollectionBeforeChangeHook = ({ data, req, originalDoc }) => {
  if (data._status === 'published') {
    if (req.user && !canPublish(req)) throw new APIError('Only an Editor can publish. Please save as a draft.', 403, null, true)
    if (!data.publishedAt && !originalDoc?.publishedAt) data.publishedAt = new Date().toISOString()
  }
  return data
}
