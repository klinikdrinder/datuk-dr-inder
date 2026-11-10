/** Form submissions from the website (never readable publicly) and the Instagram feed. */
import type { CollectionConfig } from 'payload'
import { isEditor, loggedIn } from '../lib/access'

const access = { read: loggedIn, create: isEditor, update: loggedIn, delete: isEditor }
const cap = (v: string) => ({ label: v[0].toUpperCase() + v.slice(1), value: v })

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    group: 'Enquiries',
    useAsTitle: 'name',
    defaultColumns: ['createdAt', 'name', 'phone', 'interest', 'status'],
    description: 'Consultation requests from the website. Set the status as you follow up.',
  },
  access,
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'email' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'country', type: 'text' },
        { name: 'interest', type: 'text' },
      ],
    },
    { name: 'message', type: 'textarea' },
    { name: 'status', type: 'select', defaultValue: 'new', admin: { position: 'sidebar' }, options: ['new', 'contacted', 'booked', 'closed'].map(cap) },
    { name: 'source', type: 'text', defaultValue: 'website', admin: { position: 'sidebar' } },
    { name: 'consent', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
}

export const SeminarRegistrations: CollectionConfig = {
  slug: 'seminar-registrations',
  labels: { singular: 'Seminar registration', plural: 'Seminar registrations' },
  admin: { group: 'Seminars & events', useAsTitle: 'name', defaultColumns: ['createdAt', 'name', 'phone', 'seminar', 'seats', 'status'] },
  access,
  defaultSort: '-createdAt',
  fields: [
    { name: 'seminar', type: 'relationship', relationTo: 'seminars' },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'email' },
      ],
    },
    { name: 'seats', type: 'number', defaultValue: 1, min: 1, max: 10 },
    { name: 'notes', type: 'textarea' },
    { name: 'status', type: 'select', defaultValue: 'registered', admin: { position: 'sidebar' }, options: ['registered', 'confirmed', 'attended', 'cancelled'].map(cap) },
    { name: 'consent', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
}

export const InstagramPosts: CollectionConfig = {
  slug: 'instagram-posts',
  labels: { singular: 'Instagram post', plural: 'Instagram posts' },
  admin: {
    group: 'Instagram',
    useAsTitle: 'caption',
    defaultColumns: ['posted_at', 'caption', 'pinned', 'hidden'],
    description: 'Fills itself every hour. Tick pinned to keep a post first, or hidden to remove it from the website.',
  },
  access: { read: loggedIn, create: isEditor, update: loggedIn, delete: isEditor },
  defaultSort: '-posted_at',
  fields: [
    { name: 'ig_id', type: 'text', required: true, unique: true, admin: { readOnly: true } },
    { name: 'caption', type: 'textarea', admin: { readOnly: true } },
    { name: 'media_type', type: 'text', admin: { readOnly: true } },
    { name: 'media_url', type: 'textarea', admin: { readOnly: true } },
    { name: 'thumbnail_url', type: 'textarea', admin: { readOnly: true } },
    { name: 'permalink', type: 'text', admin: { readOnly: true } },
    { name: 'posted_at', type: 'date', admin: { readOnly: true } },
    { name: 'pinned', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'hidden', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
}
