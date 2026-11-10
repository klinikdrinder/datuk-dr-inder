import type { CollectionConfig } from 'payload'
import { adminOnlyField, isAdmin, loggedIn } from '../lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', group: 'Settings', defaultColumns: ['email', 'name', 'role'] },
  auth: { maxLoginAttempts: 8, lockTime: 15 * 60 * 1000, tokenExpiration: 12 * 3600 },
  access: {
    read: loggedIn,
    create: isAdmin,
    delete: isAdmin,
    update: ({ req }) => ((req.user as any)?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
    admin: ({ req }) => !!req.user,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role', type: 'select', required: true, defaultValue: 'admin', saveToJWT: true,
      options: [
        { label: 'Super Admin — everything, including users', value: 'admin' },
        { label: 'Editor — create, edit and publish', value: 'editor' },
        { label: 'Author — write drafts only', value: 'author' },
      ],
      access: { update: adminOnlyField },
    },
  ],
}
