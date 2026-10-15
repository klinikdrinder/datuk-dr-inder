# Deploying datukdrinder.com

Order: **1 → 2 → 3 → 4 → 5**. Nothing here touches the other 19 cPanel accounts.
Never paste passwords or secrets into chat, email or GitHub — only into cPanel, Vercel and Cloudflare.

---

## 1. Admin (Strapi) on the VPS — cPanel account `datukdrkdi`

Already done: Node.js 22 + Passenger, Jailed Shell, MySQL DB/user `datukdrkdi_cms`, subdomain `cms.datukdrinder.com`.

### 1a. Give the server read access to GitHub (one time)
1. cPanel → **Security → SSH Access → Manage SSH Keys → Generate a New Key** (name `github`, no passphrase, RSA 4096). Then **Manage → Authorize**.
2. **View/Download** the *public* key (`github.pub`) and copy it.
3. GitHub → repo `klinikdrinder/datuk-dr-inder` → **Settings → Deploy keys → Add deploy key** → paste, title `cPanel datukdrkdi`, leave "Allow write access" **unticked**.

### 1b. Get the code
cPanel → **Advanced → Terminal**, paste:
```bash
mkdir -p ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
GIT_SSH_COMMAND="ssh -i ~/.ssh/github" git clone -b main git@github.com:klinikdrinder/datuk-dr-inder.git ~/datukdrinder
git -C ~/datukdrinder config core.sshCommand "ssh -i ~/.ssh/github"
```

### 1c. Settings file
```bash
cd ~/datukdrinder/cms && cp .env.example .env
for k in API_TOKEN_SALT ADMIN_JWT_SECRET TRANSFER_TOKEN_SALT JWT_SECRET ENCRYPTION_KEY FORM_SECRET EXPORT_KEY; do
  sed -i "s|^$k=.*|$k=$(openssl rand -base64 32 | tr -d '/+=' )|" .env; done
sed -i "s|^APP_KEYS=.*|APP_KEYS=$(for i in 1 2 3 4; do openssl rand -base64 24 | tr -d '/+='; done | paste -sd,)|" .env
```
Then open `datukdrinder/cms/.env` in **File Manager → Edit** and fill in by hand:
- `DATABASE_PASSWORD` = the MySQL password you saved.
- (optional) `SMTP_*` and `NOTIFY_EMAIL` for email alerts — create `noreply@datukdrinder.com` in cPanel **Email Accounts** first.
- Copy the value of **`FORM_SECRET`** somewhere safe — Vercel needs the same value (step 2).

### 1d. Install and build
```bash
export PATH=/opt/cpanel/ea-nodejs22/bin:$PATH
cd ~/datukdrinder/cms
npm ci --omit=dev
NODE_ENV=production npm run build
```
(Build takes 2–4 minutes.)

### 1e. Start it
cPanel → **Software → Application Manager → Register Application**
- Application Name: `datukdrinder-cms`
- Deployment Domain: `cms.datukdrinder.com`
- Base Application URL: `/`
- Application Path: `datukdrinder/cms`
- Deployment Environment: **Production**
- Click **Deploy**. Passenger runs `app.js`.

On first start the admin loads the current website content automatically (awards, logos, texts, hero photo, the JAPA paper, plus one SAMPLE seminar and article saved as drafts).

### 1f. Turn off NGINX caching for this account
cPanel home → right column **NGINX Caching → off** (admin pages must not be cached).

### 1g. Create the first admin
Open `https://cms.datukdrinder.com/admin` → create the **Super Admin** (use a strong password, then turn on 2FA under your profile).

---

## 2. Website on Vercel
1. vercel.com → **Add New → Project → Import** `klinikdrinder/datuk-dr-inder`.
2. **Root Directory:** `web` · Framework: **Nuxt** (auto).
3. **Environment Variables** (Production + Preview):

| Name | Value |
|---|---|
| `NUXT_CMS_URL` | `https://cms.datukdrinder.com` |
| `NUXT_PUBLIC_MEDIA_URL` | `https://cms.datukdrinder.com` |
| `NUXT_PUBLIC_SITE_URL` | `https://datukdrinder.com` |
| `NUXT_FORM_SECRET` | *same value as `FORM_SECRET` in the CMS `.env`* |

4. **Settings → Git → Production Branch:** `main`. The `dev` branch gets its own preview address automatically.
5. **Settings → Domains:** add `datukdrinder.com` and `www.datukdrinder.com`. Vercel shows the DNS records to add — use them in step 3.

---

## 3. Cloudflare DNS (`datukdrinder.com`)
| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | *value Vercel shows* (usually `76.76.21.21`) | **DNS only** (grey) |
| CNAME | `www` | *value Vercel shows* (usually `cname.vercel-dns.com`) | **DNS only** (grey) |
| A | `cms` | `148.66.154.203` | **DNS only** first |

1. After `cms` resolves, cPanel → **SSL/TLS Status → Run AutoSSL** (certificate for `cms.datukdrinder.com`; failures for the root/www are expected — Vercel handles those).
2. Then switch the `cms` record to **Proxied** (orange) and set Cloudflare **SSL/TLS → Full (strict)**.
3. cPanel → **Domains** → turn **Force HTTPS Redirect** on for `cms.datukdrinder.com`.

---

## 4. Lock the admin with Cloudflare Access (recommended)
Cloudflare → **Zero Trust → Access → Applications → Add → Self-hosted**
- Application domain: `cms.datukdrinder.com`, **paths** `admin` and `api/exports` (add both).
- Policy: **Allow** → Emails → the staff emails who may use the admin.
- Do **not** protect `/api` or `/uploads` — the website reads those.

Staff then get a one-time email code before the admin login page appears.

---

## 5. Instagram automatic feed (one time, ~15 minutes)
Needs `@datukdrinder` to be a **Professional (Creator or Business)** account.
1. developers.facebook.com → **My Apps → Create App** → use case **"Manage messaging & content on Instagram"** → name `datukdrinder website`.
2. In the app: **Instagram → API setup with Instagram login → Generate access tokens → Add account** → log in as `@datukdrinder` and allow.
3. Copy the generated token.
4. Admin → **Content Manager → Instagram Connection** → paste into **access_token** → **Save**. The latest posts appear on the website within a minute.
5. The CMS renews the token automatically before it expires (every ~60 days) and pulls new posts every hour. If **last_status** ever shows an error, generate a new token and paste it again.

---

## Updating after code changes
```bash
export PATH=/opt/cpanel/ea-nodejs22/bin:$PATH
cd ~/datukdrinder && git pull
cd cms && npm ci --omit=dev && NODE_ENV=production npm run build
mkdir -p tmp && touch tmp/restart.txt   # tells Passenger to restart
```
The website on Vercel redeploys by itself when `main` changes.

## Backups
- MySQL DB `datukdrkdi_cms` and the folder `~/datukdrinder/cms/public/uploads` hold all content — both are included in cPanel/WHM account backups. Check that account `datukdrkdi` is ticked in **WHM → Backup Configuration**.
