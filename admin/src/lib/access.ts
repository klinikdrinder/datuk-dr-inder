import type { Access, FieldAccess, PayloadRequest } from 'payload'

export type Role = 'admin' | 'editor' | 'author'
const role = (req: PayloadRequest): Role | null => ((req.user as any)?.role as Role) || null

export const loggedIn: Access = ({ req }) => !!req.user
export const isAdmin: Access = ({ req }) => role(req) === 'admin'
/** Admins and editors can change and delete anything. */
export const isEditor: Access = ({ req }) => ['admin', 'editor'].includes(role(req) || '')
export const publicRead: Access = () => true
/** Website visitors see published items only; staff see drafts too. */
export const publishedOrStaff: Access = ({ req }) => (req.user ? true : { _status: { equals: 'published' } })
export const staffOnlyField: FieldAccess = ({ req }) => !!req.user
export const adminOnlyField: FieldAccess = ({ req }) => role(req) === 'admin'
export const canPublish = (req: PayloadRequest) => ['admin', 'editor'].includes(role(req) || '')
