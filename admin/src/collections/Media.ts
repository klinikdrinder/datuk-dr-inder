import type { CollectionConfig } from 'payload'
import { isEditor, loggedIn, publicRead } from '../lib/access'

/** Resized copies are always WebP: much smaller than PNG/JPG for the same look. */
const webp = { format: 'webp' as const, options: { quality: 82 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo / file', plural: 'Media library' },
  admin: { group: 'Settings', description: 'All uploaded photos, videos and PDFs.' },
  access: { read: publicRead, create: loggedIn, update: loggedIn, delete: isEditor },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/*', 'application/pdf'],
    imageSizes: [
      { name: 'small', width: 480, withoutEnlargement: true, formatOptions: webp },
      { name: 'medium', width: 750, withoutEnlargement: true, formatOptions: webp },
      { name: 'large', width: 1200, withoutEnlargement: true, formatOptions: webp },
      { name: 'xlarge', width: 1920, withoutEnlargement: true, formatOptions: webp },
    ],
    adminThumbnail: 'small',
    focalPoint: true,
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Alternative text', admin: { description: 'Describe the photo for Google and screen readers.' } },
    { name: 'caption', type: 'text' },
  ],
}
