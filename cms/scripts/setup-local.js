'use strict';
/**
 * One-time setup for running the project on your own computer.
 * Creates cms/.env (SQLite database, random secrets) and web/.env (pointing at the local CMS)
 * with the same FORM_SECRET in both. Existing files are never overwritten (use --force to replace).
 *
 *   cd cms
 *   npm run setup:local
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const force = process.argv.includes('--force');
const rnd = (n = 32) => crypto.randomBytes(n).toString('base64').replace(/[/+=]/g, '').slice(0, 40);
const cmsEnv = path.join(__dirname, '..', '.env');
const webEnv = path.join(__dirname, '..', '..', 'web', '.env');

function write(file, content) {
  if (fs.existsSync(file) && !force) {
    console.log(`• ${path.relative(process.cwd(), file)} already exists — kept as is (use --force to replace)`);
    return false;
  }
  fs.writeFileSync(file, content);
  console.log(`✓ created ${path.relative(process.cwd(), file)}`);
  return true;
}

const formSecret = rnd(32);
const exportKey = rnd(24);

const createdCms = write(cmsEnv, [
  '# Local development settings (created by npm run setup:local). Do not upload this file.',
  'HOST=0.0.0.0',
  'PORT=1337',
  'PUBLIC_URL=',
  'IS_PROXIED=false',
  `APP_KEYS=${rnd()},${rnd()},${rnd()},${rnd()}`,
  `API_TOKEN_SALT=${rnd()}`,
  `ADMIN_JWT_SECRET=${rnd()}`,
  `TRANSFER_TOKEN_SALT=${rnd()}`,
  `JWT_SECRET=${rnd()}`,
  `ENCRYPTION_KEY=${rnd()}`,
  'DATABASE_CLIENT=sqlite',
  'DATABASE_FILENAME=.tmp/data.db',
  `FORM_SECRET=${formSecret}`,
  `EXPORT_KEY=${exportKey}`,
  'CORS_ORIGINS=http://localhost:3000',
  '',
].join('\n'));

let secretForWeb = formSecret;
if (!createdCms) {
  const m = fs.readFileSync(cmsEnv, 'utf8').match(/^FORM_SECRET=(.*)$/m);
  if (m) secretForWeb = m[1].trim();
}

write(webEnv, [
  '# Local development settings (created by npm run setup:local). Do not upload this file.',
  'NUXT_CMS_URL=http://localhost:1337',
  'NUXT_PUBLIC_MEDIA_URL=http://localhost:1337',
  'NUXT_PUBLIC_SITE_URL=http://localhost:3000',
  `NUXT_FORM_SECRET=${secretForWeb}`,
  '',
].join('\n'));

const key = (fs.readFileSync(cmsEnv, 'utf8').match(/^EXPORT_KEY=(.*)$/m) || [])[1];
console.log('\nNext:');
console.log('  1) In this window:      npm run develop        → admin at http://localhost:1337/admin');
console.log('  2) In a second window:  cd ..\\web  then  npm run dev   → website at http://localhost:3000');
if (key) console.log(`\nExcel export (local): http://localhost:1337/api/exports/enquiries?key=${key}`);
