# datukdrinder.com

Personal website of **Datuk Dr Inderjit Kaur (DPSM)** with a staff admin for seminars, the journal, photos and enquiries.

| Folder | What it is | Runs on |
|---|---|---|
| `web/` | Public website (Nuxt 4 / Vue) | Vercel → `datukdrinder.com` |
| `cms/` | Admin + content API (Strapi 5) | GoDaddy VPS, cPanel account `datukdrkdi` → `cms.datukdrinder.com` |

- **Branches:** `main` = live site. `dev` = work in progress (Vercel preview address). Changes reach `main` only after approval.
- **Deploying:** see [`DEPLOY.md`](DEPLOY.md).
- **Using the admin:** see [`ADMIN-GUIDE.md`](ADMIN-GUIDE.md).

## Local development
```bash
# 1) Admin / API (SQLite locally)
cd cms && cp .env.example .env   # fill the secrets, set DATABASE_CLIENT=sqlite
npm install && npm run develop    # http://localhost:1337/admin

# 2) Website
cd web && npm install
NUXT_CMS_URL=http://localhost:1337 NUXT_FORM_SECRET=<same as cms FORM_SECRET> npm run dev   # http://localhost:3000
```
The website still renders with built-in default content if the CMS is unreachable.
