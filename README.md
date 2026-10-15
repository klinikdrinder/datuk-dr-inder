# datukdrinder.com

Personal website of **Datuk Dr Inderjit Kaur (DPSM)** with a staff admin for seminars, the journal, photos and enquiries.

| Folder | What it is | Runs on |
|---|---|---|
| `web/` | Public website (Nuxt 4 / Vue) | Vercel → `datukdrinder.com` |
| `cms/` | Admin + content API (Strapi 5) | GoDaddy VPS, cPanel account `datukdrkdi` → `cms.datukdrinder.com` |

- **Branches:** `main` = live site. `dev` = work in progress (Vercel preview address). Changes reach `main` only after approval.
- **Deploying:** see [`DEPLOY.md`](DEPLOY.md).
- **Using the admin:** see [`ADMIN-GUIDE.md`](ADMIN-GUIDE.md).

## Run everything on your PC (Windows)
Needs **Node.js 22** — the same version as the server. Download the **v22 Windows Installer (.msi)** from https://nodejs.org/en/download (choose version 22), then close and reopen VS Code and check `node -v` shows `v22.x`. Newer versions (Node 26) cannot install the local database module without extra build tools.

**Window 1 — admin**
```powershell
cd cms
npm install
npm run setup:local      # creates cms\.env and web\.env with matching secrets (SQLite database)
npm run develop          # admin: http://localhost:1337/admin
```
First time only: create your admin account on that page. The admin fills itself with the current website content.

**Window 2 — website** (VS Code: Terminal → New Terminal)
```powershell
cd web
npm ci
npm run dev              # website: http://localhost:3000
```
Stop either one with **Ctrl + C**. Next time you only need `npm run develop` and `npm run dev`.

Content you add on your PC can later be copied to the live admin with Strapi's transfer command (see DEPLOY.md).
The website still renders with built-in default content if the CMS is not running.
