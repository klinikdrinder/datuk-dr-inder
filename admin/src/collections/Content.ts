/** Simple homepage lists: awards, certificates, logos, press, publications, categories. */
import type { CollectionConfig } from 'payload'
import { isEditor, loggedIn, publicRead } from '../lib/access'
import { orderField, slugField } from '../lib/fields'

const G = 'Homepage'
const staffWrite = { read: publicRead, create: loggedIn, update: loggedIn, delete: isEditor }

export const Awards: CollectionConfig = {
  slug: 'awards',
  admin: { group: G, useAsTitle: 'title', defaultColumns: ['year', 'title', 'presented_by', 'show_on_ring'] },
  access: staffWrite,
  defaultSort: 'order',
  fields: [
    { name: 'year', type: 'text', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'presented_by', type: 'text', required: true },
    { name: 'certificate_image', type: 'upload', relationTo: 'media', admin: { description: 'Also shows the certificate under "Award certificates".' } },
    { name: 'show_on_ring', type: 'checkbox', defaultValue: true, label: 'Show on the 3D ring' },
    orderField,
  ],
}

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  admin: { group: G, useAsTitle: 'title', defaultColumns: ['title', 'issuer', 'year'] },
  access: staffWrite,
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'issuer', type: 'text' },
    { name: 'year', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Scan of the certificate. Cover any IC number first.' } },
    orderField,
  ],
}

export const RecognitionLogos: CollectionConfig = {
  slug: 'recognition-logos',
  labels: { singular: 'Recognition logo', plural: 'Recognition logos' },
  admin: { group: G, useAsTitle: 'name', description: 'The logo strip under the hero.' },
  access: staffWrite,
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'caption', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    orderField,
  ],
}

export const PressFeatures: CollectionConfig = {
  slug: 'press-features',
  labels: { singular: 'Press feature', plural: 'Press features (magazines)' },
  admin: { group: G, useAsTitle: 'publication', defaultColumns: ['publication', 'headline', 'date'], description: 'Shown in "Datuk Dr Inder in magazines".' },
  access: staffWrite,
  defaultSort: ['order', '-date'],
  fields: [
    { name: 'publication', type: 'text', required: true, admin: { description: 'e.g. The Star' } },
    { name: 'headline', type: 'text' },
    { name: 'date', type: 'date', admin: { description: 'Only the year is shown.' } },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'The clipping or cover shown on the magazine wall.' } },
    { name: 'pages', type: 'upload', relationTo: 'media', hasMany: true, admin: { description: 'Optional extra pages. Visitors flip through image + pages in order.' } },
    { name: 'link', type: 'text', admin: { description: 'Optional link to the online article.' } },
    orderField,
  ],
}

export const Publications: CollectionConfig = {
  slug: 'publications',
  admin: { group: G, useAsTitle: 'title', defaultColumns: ['title', 'journal', 'published_on'] },
  access: staffWrite,
  defaultSort: '-published_on',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'authors', type: 'text', defaultValue: 'Inderjit Kaur' },
    { name: 'journal', type: 'text' },
    { name: 'citation', type: 'text' },
    { name: 'abstract', type: 'textarea' },
    { name: 'pdf', type: 'upload', relationTo: 'media', admin: { description: 'Visitors can read or download it.' } },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'link', type: 'text' },
    { name: 'published_on', type: 'date' },
  ],
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Journal category', plural: 'Journal categories' },
  admin: { group: 'Journal', useAsTitle: 'name' },
  access: staffWrite,
  defaultSort: 'name',
  fields: [{ name: 'name', type: 'text', required: true }, slugField('name')],
}
