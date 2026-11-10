import type { CollectionConfig } from 'payload'
import { isEditor, loggedIn, publicRead } from '../lib/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo / file', plural: 'Media library' },
  admin: { group: 'Settings', description: 'All uploaded photos, videos and PDFs.' },
  access: { read: publicRead, create: loggedIn, update: loggedIn, delete: isEditor },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/*', 'application/pdf'],
    imageSizes: [
      { name: 'small', width: 480, withoutEnlargement: true },
      { name: 'medium', width: 750, withoutEnlargement: true },
      { name: 'large', width: 1200, withoutEnlargement: true },
      { name: 'xlarge', width: 1920, withoutEnlargement: true },
    ],
    adminThumbnail: 'small',
    focalPoint: true,
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Alternative text', admin: { description: 'Describe the photo for Google and screen readers.' } },
    { name: 'caption', type: 'text' },
  ],
}
