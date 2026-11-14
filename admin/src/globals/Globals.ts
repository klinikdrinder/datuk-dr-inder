import type { GlobalConfig } from 'payload'
import { isEditor, loggedIn, publicRead, staffOnlyField } from '../lib/access'
import { syncInstagram } from '../lib/instagram'

const tip = 'Put a word in *asterisks* to show it in red italics.'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Homepage', description: 'Hero text and photo, contact details, video and SEO.' },
  access: { read: publicRead, update: isEditor },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'hero_eyebrow', type: 'text', defaultValue: 'Founder & CEO' },
            { name: 'hero_intro', type: 'textarea', defaultValue: 'A board-certified hair restoration physician who has spent more than three decades designing hairlines that look like they were always there.' },
            { name: 'hero_photo', type: 'upload', relationTo: 'media', admin: { description: 'Best as a cut-out (transparent background) portrait.' } },
            {
              type: 'row',
              fields: [
                { name: 'stat_years', type: 'text', defaultValue: '30+' },
                { name: 'stat_years_label', type: 'text', defaultValue: 'Years in hair restoration' },
                { name: 'stat_awards_label', type: 'text', defaultValue: 'Awards since 2020' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'chip1_title', type: 'text', defaultValue: 'ABHRS Diplomate', label: 'Floating card title' },
                { name: 'chip1_text', type: 'text', defaultValue: 'American Board of Hair Restoration Surgery', label: 'Floating card text' },
              ],
            },
            { name: 'hero_specialties_label', type: 'text', defaultValue: 'Expert on', label: 'Specialties card heading' },
            {
              name: 'hero_specialties',
              type: 'textarea',
              label: 'Specialties (one per line)',
              defaultValue: 'iGraft Long-Hair FUE\nHairline Design\nDonor Assessment & Long-Term Planning\nCorrective Hair Transplantation',
            },
            {
              type: 'row',
              fields: [
                { name: 'signature_label', type: 'text', defaultValue: 'Signature approach', label: 'Banner label', admin: { description: 'Small gold text on the banner over the photo.' } },
                { name: 'signature_text', type: 'text', defaultValue: 'Patient comfort & personalised pain management', label: 'Banner text', admin: { description: 'Leave empty to hide the banner.' } },
              ],
            },
            { name: 'intro_video_url', type: 'text', admin: { description: 'Intro film link (YouTube or Vimeo).' } },
          ],
        },
        {
          label: 'Founder video & LCP',
          fields: [
            { name: 'story_video', type: 'upload', relationTo: 'media', admin: { description: 'Short silent loop (MP4, 10–20 s, under ~10 MB) that plays inside the arch in "The Founder".' } },
            { name: 'story_video_url', type: 'text', admin: { description: 'Full video with sound (YouTube/Vimeo link) — adds a "Watch" button.' } },
            { name: 'lcp_certificate', type: 'upload', relationTo: 'media', admin: { description: 'Always cover the IC number first.' } },
            { name: 'lcp_label', type: 'text', defaultValue: 'Letter of Credentialing & Privileging, Ministry of Health Malaysia' },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'whatsapp_number', type: 'text', defaultValue: '60125174606', admin: { description: 'Digits only, with country code.' } },
                { name: 'phone_display', type: 'text', defaultValue: '+60 12-517 4606' },
              ],
            },
            { name: 'address_line1', type: 'text', defaultValue: '102 Jalan Gasing' },
            { name: 'address_line2', type: 'text', defaultValue: '46000 Petaling Jaya, Selangor' },
            { name: 'map_url', type: 'text', defaultValue: 'https://g.page/hairtransplantcentremalaysia?share' },
            {
              name: 'notify_email',
              type: 'email',
              access: { read: staffOnlyField },
              admin: { description: 'New enquiries and seminar registrations are emailed here (when email is set up).' },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seo_title', type: 'text', defaultValue: 'Datuk Dr Inder | Hair Restoration Physician, Malaysia' },
            { name: 'seo_description', type: 'textarea' },
            { name: 'og_image', type: 'upload', relationTo: 'media', admin: { description: 'Image shown when the site is shared on WhatsApp/Facebook.' } },
          ],
        },
      ],
    },
  ],
}

const section = (key: string, label: string, title: string, photos?: string) => ({
  label,
  fields: [
    { name: `${key}_title`, type: 'text' as const, defaultValue: title, admin: { description: tip } },
    { name: `${key}_body`, type: 'richText' as const, admin: { description: 'Leave empty to keep the built-in text.' } },
    ...(photos ? [{ name: photos, type: 'upload' as const, relationTo: 'media' as const, hasMany: true, admin: { description: 'Photo gallery for this section.' } }] : []),
  ],
})

export const HomeContent: GlobalConfig = {
  slug: 'home-content',
  label: 'Page sections',
  admin: { group: 'Homepage', description: 'Titles, text and photo galleries for each homepage section.' },
  access: { read: publicRead, update: isEditor },
  fields: [
    {
      type: 'tabs',
      tabs: [
        section('story', 'The Founder', 'A pioneer who shaped hair restoration in *Malaysia*'),
        {
          label: 'Philosophy',
          fields: [{ name: 'philosophy_quote', type: 'textarea', defaultValue: 'Hair restoration should never look artificial, and results should age naturally with the patient.' }],
        },
        section('credentials', 'Credentials', 'Internationally certified. Globally *trusted*.'),
        section('expertise', 'Expertise', 'Precision. Artistry. *Natural* results.', 'expertise_photos'),
        section('leadership', 'Leadership', 'Leading the industry, not *following* it', 'leadership_photos'),
        section('awards', 'Awards', 'Recognised excellence across Asia-Pacific', 'award_photos'),
        section('clinic', 'Clinic', 'Klinik Dr Inder, where expertise meets *care*'),
        {
          label: 'Magazines & Instagram',
          fields: [
            { name: 'press_title', type: 'text', defaultValue: 'As featured in *the press*', admin: { description: `Heading of "Datuk Dr Inder in magazines". ${tip}` } },
            { name: 'instagram_title', type: 'text', defaultValue: 'Follow her *work*', admin: { description: tip } },
            { name: 'instagram_handle', type: 'text', defaultValue: 'datukdrinder' },
          ],
        },
      ],
    },
  ],
}

export const InstagramSettings: GlobalConfig = {
  slug: 'instagram-settings',
  label: 'Instagram connection',
  admin: { group: 'Instagram', description: 'Paste the access token once; posts then sync every hour and the token renews itself.' },
  access: { read: loggedIn, update: isEditor },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, context }) => {
        if (context?.skipSync) return data
        if (data.access_token && data.access_token !== originalDoc?.access_token) {
          data.token_expires_at = new Date(Date.now() + 59 * 86400 * 1000).toISOString()
          data.last_status = 'New token saved — syncing…'
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, context }) => {
        if (!context?.skipSync && doc.access_token && doc.access_token !== previousDoc?.access_token) {
          await syncInstagram(req.payload).catch(() => {})
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'access_token', type: 'textarea', admin: { description: 'From developers.facebook.com → your app → Instagram → Generate access tokens.' } },
    { name: 'posts_to_show', type: 'number', defaultValue: 8 },
    { name: 'account_username', type: 'text', admin: { readOnly: true } },
    { name: 'token_expires_at', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'last_synced_at', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'last_status', type: 'textarea', admin: { readOnly: true } },
  ],
}
