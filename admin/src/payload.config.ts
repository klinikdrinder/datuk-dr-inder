import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Awards, Categories, Certificates, PressFeatures, Publications, RecognitionLogos } from './collections/Content'
import { Enquiries, InstagramPosts, SeminarRegistrations } from './collections/Inbox'
import { Media } from './collections/Media'
import { Articles, Events, Seminars } from './collections/Publishing'
import { Users } from './collections/Users'
import { endpoints } from './endpoints'
import { HomeContent, InstagramSettings, SiteSettings } from './globals/Globals'
import { SUPABASE_CA } from './lib/supabase-ca'
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3001')
const websiteURL = process.env.WEBSITE_URL || 'http://localhost:3000'

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — Datuk Dr Inder admin' },
    dateFormat: 'd MMM yyyy, h:mm a',
  },
  cors: [websiteURL, 'https://datukdrinder.com', 'https://www.datukdrinder.com'],
  csrf: [serverURL],
  collections: [
    Events, Seminars, SeminarRegistrations, Enquiries,
    Articles, Categories,
    Awards, Certificates, RecognitionLogos, PressFeatures, Publications,
    InstagramPosts, Media, Users,
  ],
  globals: [SiteSettings, HomeContent, InstagramSettings],
  endpoints,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    // Own schema, so this admin never touches other apps' tables in the shared Supabase project.
    schemaName: process.env.DATABASE_SCHEMA || 'datuk_cms',
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      // Supabase: encrypted and verified against Supabase's own root certificate.
      ...(/supabase\.(com|co)/.test(process.env.DATABASE_URL || '') ? { ssl: { ca: SUPABASE_CA, rejectUnauthorized: true } } : {}),
      // Each Vercel function gets its own pool; keep it small so the Supabase pooler isn't exhausted.
      max: process.env.VERCEL ? 2 : 10,
      idleTimeoutMillis: process.env.VERCEL ? 10_000 : 30_000,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  upload: { limits: { fileSize: 60 * 1024 * 1024 } },
  sharp,
  ...(process.env.SMTP_HOST
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.SMTP_FROM || 'noreply@datukdrinder.com',
          defaultFromName: 'Datuk Dr Inder website',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 465),
            secure: (process.env.SMTP_SECURE || 'true') !== 'false',
            auth: { user: process.env.SMTP_USERNAME, pass: process.env.SMTP_PASSWORD },
          },
        }),
      }
    : {}),
  plugins: [
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      // Photos are public anyway: serve them straight from the Blob CDN (faster, no admin function call per image).
      collections: { media: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      // Browser uploads straight to Blob, so large photos/videos are not limited by Vercel's 4.5 MB request size.
      clientUploads: true,
    }),
  ],
})
