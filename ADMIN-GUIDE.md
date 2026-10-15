# Admin guide — datukdrinder.com

Log in at **https://cms.datukdrinder.com/admin**. Everything below is under **Content Manager** (left menu).
Changes appear on the website within about **2 minutes** after you press **Save** / **Publish**.

## Who can do what
| Role | Who | Can |
|---|---|---|
| Super Admin | Boss | Everything, including users and settings |
| Editor | Datuk Dr Inder | Create, edit and **publish** anything |
| Author | Staff writers | Write drafts only — an Editor reviews and publishes |

Add people under **Settings → Administration Panel → Users → Invite new user**.

## Seminars (every month or quarter)
1. **Seminar → Create new entry.**
2. Fill in title, **starts_at** (date & time), venue (or tick **is_online**), summary, description, poster image, fee, capacity.
3. **registration_mode:** `form` (registration form on the website), `whatsapp`, `external` (fill **external_url**) or `closed`.
4. **Publish** now — or set **publish_at** and leave it as a draft; it publishes itself at that time.
- The next seminar shows automatically on the homepage with a countdown. After the date it moves to **Past seminars**.
- **Registrations:** Content Manager → **Seminar Registration** (filter by seminar). Change **status** to confirmed / attended / cancelled.
- **Excel download:** `https://cms.datukdrinder.com/api/exports/registrations?key=EXPORT_KEY&seminar=SEMINAR-SLUG` (ask the Super Admin for the key; leave out `&seminar=…` for all).

## Journal (blog)
1. **Journal Article → Create new entry.** Title, category, excerpt (1–2 sentences), cover photo, body.
2. Writers press **Save** (draft). Editors press **Publish**, or set **publish_at** to schedule.
3. Every article automatically shows "Medically reviewed by Datuk Dr Inderjit Kaur" and a medical disclaimer.
4. Keep claims factual. Avoid "best", "guaranteed", "painless" and before/after photos without written patient consent.

## Homepage text & photo galleries
- **Site Settings → Founder video & LCP:** upload a short silent loop (**story_video**, MP4, 10–20 s, under ~10 MB) — it plays inside the arch in “The Founder”. Paste the full video with sound as a YouTube/Vimeo link in **story_video_url** (adds a “Watch” button). Upload the LCP certificate in **lcp_certificate** — always cover the IC number first.
- **Site Settings:** hero text, hero photo, stats, the two floating cards, WhatsApp/phone/address, intro film link (YouTube or Vimeo link), SEO text, **notify_email** for alerts.
- **Page Sections:** titles and text for each section, plus the photo galleries (**expertise_photos**, **leadership_photos**, **award_photos**).
  - Tip: put a word in `*asterisks*` in a title to show it in red italics, e.g. `Leading the industry, not *following* it`.
  - Photo captions and alt text: **Media Library** → click the photo → edit **Caption** and **Alternative text**.

## Certificates, awards, logos, press, publications
- **Certificate:** upload the scan, title, issuer, year, order (small numbers first).
- **Award:** year, title, presented by. Tick **show_on_ring** to show it on the 3D ring. Add **certificate_image** to also show it in "Award certificates". The award counts on the site update automatically.
- **Recognition Logo:** the strip under the hero (logo + short caption).
- **Press Feature:** magazine/newspaper clippings.
- **Publication:** journal papers — upload the PDF and visitors can read or download it.

## Enquiries
- **Enquiry:** every consultation request. Set **status** to contacted / booked / closed.
- Excel: `https://cms.datukdrinder.com/api/exports/enquiries?key=EXPORT_KEY`
- If email alerts are set up, each new enquiry or registration is also emailed to **notify_email**.

## Instagram
- **Instagram Post** fills itself every hour from @datukdrinder.
- Tick **pinned** to keep a video first, or **hidden** to remove it from the website.
- **Instagram Connection** shows **last_status** — if it says "failed", paste a new token (see DEPLOY.md step 5).
