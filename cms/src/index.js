'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Content the website may READ without logging in (published items only).
 * Enquiries and seminar registrations are never readable publicly.
 */
const PUBLIC_READ = [
  'api::site-setting.site-setting',
  'api::home-content.home-content',
  'api::recognition-logo.recognition-logo',
  'api::certificate.certificate',
  'api::award.award',
  'api::press-feature.press-feature',
  'api::publication.publication',
  'api::category.category',
  'api::article.article',
  'api::seminar.seminar',
];

async function setPublicPermissions(strapi) {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!role) return;
  const wanted = [];
  for (const uid of PUBLIC_READ) {
    const kind = strapi.contentType(uid).kind;
    wanted.push(`${uid}.find`);
    if (kind === 'collectionType') wanted.push(`${uid}.findOne`);
  }
  const existing = await strapi.db.query('plugin::users-permissions.permission').findMany({
    where: { role: role.id }, select: ['id', 'action'],
  });
  const have = new Set(existing.map((p) => p.action));
  for (const action of wanted) {
    if (!have.has(action)) {
      await strapi.db.query('plugin::users-permissions.permission').create({ data: { action, role: role.id } });
    }
  }
  // remove anything else that may have been granted to Public by mistake (forms go through the secured website routes)
  const remove = existing.filter((p) => p.action.startsWith('api::') && !wanted.includes(p.action));
  for (const p of remove) await strapi.db.query('plugin::users-permissions.permission').delete({ where: { id: p.id } });
}

async function uploadFile(strapi, filePath, info) {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).slice(1);
  const [file] = await strapi.plugin('upload').service('upload').upload({
    data: { fileInfo: info },
    files: { filepath: filePath, originalFilename: path.basename(filePath), mimetype: `image/${ext}`, size: stat.size },
  });
  return file;
}

async function seed(strapi) {
  if (process.env.SEED_DEFAULTS === 'false') return;
  const awardCount = await strapi.db.query('api::award.award').count();
  if (awardCount > 0) return; // already seeded once — never overwrite staff edits

  const dir = path.join(__dirname, '..', 'seed');
  const D = JSON.parse(fs.readFileSync(path.join(dir, 'defaults.json'), 'utf8'));
  strapi.log.info('[seed] First start: loading the current website content into the admin…');

  const hero = await uploadFile(strapi, path.join(dir, 'datuk-dr-inder-hero.webp'), {
    name: 'datuk-dr-inder-hero', alternativeText: 'Datuk Dr Inderjit Kaur in her white clinic coat, holding her glasses',
  });
  await strapi.documents('api::site-setting.site-setting').create({ data: { ...D.site, hero_photo: hero.id, og_image: hero.id } });
  await strapi.documents('api::home-content.home-content').create({ data: D.home });

  for (const [i, a] of D.awards.entries()) {
    await strapi.documents('api::award.award').create({ data: { year: a[0], title: a[1], presented_by: a[2], order: i, show_on_ring: true } });
  }
  for (const [i, l] of D.logos.entries()) {
    const f = path.join(dir, 'logos', `${l[0]}.webp`);
    const logo = fs.existsSync(f) ? await uploadFile(strapi, f, { name: `logo-${l[0]}`, alternativeText: l[3] }) : null;
    await strapi.documents('api::recognition-logo.recognition-logo').create({ data: { name: l[1], caption: l[2], logo: logo && logo.id, order: i } });
  }
  for (const p of D.publications) await strapi.documents('api::publication.publication').create({ data: p });
  const cats = {};
  for (const name of D.categories) {
    const c = await strapi.documents('api::category.category').create({ data: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') } });
    cats[name] = c.documentId;
  }

  // Samples stay as DRAFTS (not visible on the website) so staff can see how entries look.
  const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1); nextMonth.setHours(10, 0, 0, 0);
  await strapi.documents('api::seminar.seminar').create({
    data: {
      title: 'SAMPLE – Understanding Hair Loss: Causes and Modern Treatment',
      slug: 'sample-understanding-hair-loss', starts_at: nextMonth.toISOString(), venue: 'Klinik Dr Inder, Petaling Jaya',
      summary: 'Replace this sample with a real seminar. Drafts are not shown on the website until you press Publish.',
      fee: 'Free', capacity: 40, registration_mode: 'form',
      description: [{ type: 'paragraph', children: [{ type: 'text', text: 'Describe the seminar: who it is for, what will be covered, and what attendees should bring.' }] }],
    },
  });
  await strapi.documents('api::article.article').create({
    data: {
      title: 'SAMPLE – What to Expect in Your First Hair Restoration Consultation',
      slug: 'sample-first-consultation', category: cats['Hair Restoration'],
      excerpt: 'Replace this sample with a real article. Writers save drafts; an Editor reviews and publishes.',
      body: [
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'Write your heading here' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Write the article in plain language. Use headings, short paragraphs and bullet lists.' }] },
      ],
    },
  });
  strapi.log.info('[seed] Done. Default content loaded.');
}

module.exports = {
  register() {},
  async bootstrap({ strapi }) {
    try { await setPublicPermissions(strapi); } catch (e) { strapi.log.error(`[bootstrap] permissions: ${e.message}`); }
    try { await seed(strapi); } catch (e) { strapi.log.error(`[seed] ${e.stack || e.message}`); }
  },
};
