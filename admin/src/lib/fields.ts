import type { Field } from 'payload'
import { slugFromTitle } from './hooks'

export const slugField = (source = 'title'): Field => ({
  name: 'slug', type: 'text', required: true, unique: true, index: true,
  admin: { position: 'sidebar', description: 'Web address. Leave empty to fill from the title.' },
  hooks: { beforeValidate: [slugFromTitle(source)] },
})
export const orderField: Field = {
  name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar', description: 'Smaller numbers show first.' },
}
export const publishedAtField: Field = {
  name: 'publishedAt', type: 'date', admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
}
export const publishAtField: Field = {
  name: 'publish_at', type: 'date',
  admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' }, description: 'Optional: leave this as a draft and it publishes itself at this time.' },
}
