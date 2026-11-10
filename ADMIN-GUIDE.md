# Admin guide — datukdrinder.com

Log in at **https://datuk-dr-inder-admin.vercel.app/admin** (later **https://admin.datukdrinder.com/admin** once the domain is connected). Everything is in the left menu, grouped by Seminars & events, Enquiries, Journal, Homepage, Instagram and Settings.
Changes appear on the website within about **1 minute** after you press **Save** / **Publish changes**.

## Who can do what
| Role | Who | Can |
|---|---|---|
| Super Admin | Boss | Everything, including users and settings |
| Editor | Datuk Dr Inder | Create, edit and **publish** anything |
| Author | Staff writers | Write drafts only — an Editor reviews and publishes |

Add people under **Settings → Users → Create new** (choose the role). Only a Super Admin can add users or change roles.

## Seminars (every month or quarter)
1. **Seminar → Create new entry.**
2. Fill in title, **starts_at** (date & time), venue (or tick **is_online**), summary, description, poster image, fee, capacity.
3. **registration_mode:** `form` (registration form on the website), `whatsapp`, `external` (fill **external_url**) or `closed`.
4. **Publish** now — or set **publish_at** and leave it as a draft; it publishes itself at that time.
- The next seminar shows automatically on the homepage with a countdown. After the date it moves to **Past seminars**.
- **Registrations:** **Seminars & events → Seminar registrations** (filter by seminar). Change **status** to confirmed / attended / cancelled.
- **Excel download:** `https://datuk-dr-inder-admin.vercel.app/api/exports/registrations?key=EXPORT_KEY&seminar=SEMINAR-SLUG` (ask the Super Admin for the key; leave out `&seminar=…` for all).

## Events & photos (seminars, congresses, awards, media)
Use this after every seminar, international congress, award night or TV/press appearance.
1. **Event → Create new entry.**
2. Fill in **title**, **date** (and **end_date** for multi-day events), **city**, **country** (leave "Malaysia" for local events — any other country is labelled *International* automatically).
3. **role:** Speaker, Faculty, Organiser, Award, Guest, Media or Attendee. **highlight** is an optional short extra tag, e.g. `Live surgery`.
4. **photos:** drag in the photos. **The first photo is the cover** — drag to reorder. Add captions in **Settings → Media library** if you like (otherwise the event title is used).
5. Optional: **summary** (shown on the big card) and **seminar** — link one of Datuk's own seminars and its photos also appear on that seminar's page.
6. **Publish.**
- The newest 3 show on the homepage under **Latest events attended**, each as a photo collage: the first 5 photos when the event has 5 or more, the first 3 when it has 3–4, otherwise just the cover. Put the best photos first.
- Every event is on **/events**, grouped by year. The counters (events, countries, this year) and the year filters update themselves.
- Photos: landscape JPGs around 2000 px wide are ideal; the website makes smaller copies automatically.

## Journal (blog)
1. **Journal Article → Create new entry.** Title, category, excerpt (1–2 sentences), cover photo, body.
2. Writers press **Save** (draft). Editors press **Publish**, or set **publish_at** to schedule.
3. Every article automatically shows "Medically reviewed by Datuk Dr Inderjit Kaur" and a medical disclaimer.
4. Keep claims factual. Avoid "best", "guaranteed", "painless" and before/after photos without written patient consent.

## Homepage text & photo galleries
- **Homepage → Site settings → Founder video & LCP:** upload a short silent loop (**story_video**, MP4, 10–20 s, under ~10 MB) — it plays inside the arch in “The Founder”. Paste the full video with sound as a YouTube/Vimeo link in **story_video_url** (adds a “Watch” button). Upload the LCP certificate in **lcp_certificate** — always cover the IC number first.
- **Homepage → Site settings:** hero text, hero photo, stats, the two floating cards, WhatsApp/phone/address, intro film link (YouTube or Vimeo link), SEO text, **notify_email** for alerts.
- **Page Sections:** titles and text for each section, plus the photo galleries (**expertise_photos**, **leadership_photos**, **award_photos**).
  - Tip: put a word in `*asterisks*` in a title to show it in red italics, e.g. `Leading the industry, not *following* it`.
  - Photo captions and alt text: **Settings → Media library** → click the photo → edit **Caption** and **Alternative text**.

## Certificates, awards, logos, press, publications
- **Certificate:** upload the scan, title, issuer, year, order (small numbers first).
- **Award:** year, title, presented by. Tick **show_on_ring** to show it on the 3D ring. Add **certificate_image** to also show it in "Award certificates". The award counts on the site update automatically.
- **Recognition Logo:** the strip under the hero (logo + short caption).
- **Press Feature** (homepage section **Datuk Dr Inder in magazines**): one entry per magazine or newspaper feature.
  - **publication** (e.g. *The Star*), **headline**, **date** (the year is shown), optional **link** to the online article.
  - **image:** the clipping or cover shown on the magazine wall. **pages:** optional extra pages — visitors flip through image + pages in order.
  - **order:** smaller numbers show first; otherwise newest first. The first 12 show, with a "Show all" button for the rest.
  - The section heading is **press_title** in **Homepage → Page sections** (`*asterisks*` = red italics).
- **Publication:** journal papers — upload the PDF and visitors can read or download it.

## Enquiries
- **Enquiry:** every consultation request. Set **status** to contacted / booked / closed.
- Excel: `https://datuk-dr-inder-admin.vercel.app/api/exports/enquiries?key=EXPORT_KEY`
- If email alerts are set up, each new enquiry or registration is also emailed to **notify_email**.

## Instagram
- **Instagram Post** fills itself every hour from @datukdrinder.
- Tick **pinned** to keep a video first, or **hidden** to remove it from the website.
- **Instagram → Instagram connection** shows **last_status** — if it says "failed", paste a new token (see DEPLOY.md step 5).
