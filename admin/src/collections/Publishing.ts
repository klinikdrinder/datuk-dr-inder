/** Items with drafts: journal articles, seminars and events. */
import type { CollectionConfig } from 'payload'
import { isEditor, loggedIn, publishedOrStaff } from '../lib/access'
import { draftRules } from '../lib/hooks'
import { publishAtField, publishedAtField, slugField } from '../lib/fields'

const versions = { drafts: { autosave: false }, maxPerDoc: 20 }
const access = { read: publishedOrStaff, create: loggedIn, update: loggedIn, delete: isEditor, readVersions: loggedIn }

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Journal article', plural: 'Journal articles' },
  admin: { group: 'Journal', useAsTitle: 'title', defaultColumns: ['title', 'category', '_status', 'publishedAt'] },
  access,
  versions,
  defaultSort: '-publishedAt',
  hooks: { beforeChange: [draftRules] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea', admin: { description: '1–2 sentences shown on the journal list.' } },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText' },
    slugField(),
    { name: 'category', type: 'relationship', relationTo: 'categories', admin: { position: 'sidebar' } },
    { name: 'author_name', type: 'text', defaultValue: 'Datuk Dr Inder', admin: { position: 'sidebar' } },
    { name: 'reviewed_by', type: 'text', defaultValue: 'Datuk Dr Inderjit Kaur (DPSM), MBBS, ABHRS Diplomate', admin: { position: 'sidebar' } },
    { name: 'reading_minutes', type: 'number', admin: { position: 'sidebar', description: 'Leave empty to work it out automatically.' } },
    publishAtField,
    publishedAtField,
    {
      type: 'collapsible',
      label: 'SEO',
      admin: { initCollapsed: true },
      fields: [
        { name: 'seo_title', type: 'text' },
        { name: 'seo_description', type: 'textarea' },
      ],
    },
  ],
}

export const Seminars: CollectionConfig = {
  slug: 'seminars',
  admin: {
    group: 'Seminars & events',
    useAsTitle: 'title',
    defaultColumns: ['title', 'starts_at', 'registration_mode', '_status'],
    description: 'The next seminar shows on the homepage with a countdown. After the date it moves to Past seminars.',
  },
  access,
  versions,
  defaultSort: '-starts_at',
  hooks: { beforeChange: [draftRules] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'starts_at', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'ends_at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    { name: 'venue', type: 'text' },
    {
      type: 'row',
      fields: [
        { name: 'is_online', type: 'checkbox', defaultValue: false },
        { name: 'online_link', type: 'text' },
      ],
    },
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'richText' },
    { name: 'poster', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'fee', type: 'text', defaultValue: 'Free' },
        { name: 'capacity', type: 'number' },
      ],
    },
    {
      name: 'registration_mode',
      type: 'select',
      required: true,
      defaultValue: 'form',
      options: [
        { label: 'Form on the website', value: 'form' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'External link', value: 'external' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    { name: 'external_url', type: 'text', admin: { condition: (d) => d?.registration_mode === 'external' } },
    slugField(),
    publishAtField,
    publishedAtField,
  ],
}

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events & photos' },
  admin: {
    group: 'Seminars & events',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'city', 'country', '_status'],
    description: 'After every seminar, congress, award night or media appearance. The newest 3 show on the homepage.',
  },
  access,
  versions,
  defaultSort: '-date',
  hooks: { beforeChange: [draftRules] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } } },
        { name: 'end_date', type: 'date', admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' }, description: 'For multi-day events.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'city', type: 'text' },
        { name: 'country', type: 'text', defaultValue: 'Malaysia', admin: { description: 'Any other country is labelled International.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'role', type: 'select', required: true, defaultValue: 'Speaker', options: ['Speaker', 'Faculty', 'Organiser', 'Award', 'Guest', 'Media', 'Attendee'] },
        { name: 'highlight', type: 'text', maxLength: 30, admin: { description: 'Optional short tag, e.g. Live surgery' } },
      ],
    },
    { name: 'summary', type: 'textarea', maxLength: 300 },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      admin: { description: 'The first photo is the cover. Put the best photos first (drag to reorder).' },
    },
    {
      name: 'seminar',
      type: 'relationship',
      relationTo: 'seminars',
      admin: { position: 'sidebar', description: 'Optional: link one of the doctor’s own seminars — the photos also appear on its page.' },
    },
    publishedAtField,
  ],
}
