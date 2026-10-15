'use strict';
/** Publishes drafts whose "publish_at" time has passed (articles and seminars). */
const UIDS = ['api::article.article', 'api::seminar.seminar'];

module.exports = async (strapi) => {
  const now = new Date().toISOString();
  for (const uid of UIDS) {
    try {
      const due = await strapi.documents(uid).findMany({
        status: 'draft',
        filters: { publish_at: { $notNull: true, $lte: now } },
        fields: ['documentId', 'publish_at', 'updatedAt'],
        limit: 50,
      });
      for (const doc of due) {
        const live = await strapi.documents(uid).findOne({ documentId: doc.documentId, status: 'published', fields: ['publishedAt'] });
        // publish if never published, or the draft was edited after the live version
        if (!live || new Date(doc.updatedAt) > new Date(live.publishedAt)) {
          if (live && new Date(doc.publish_at) <= new Date(live.publishedAt)) continue;
          await strapi.documents(uid).publish({ documentId: doc.documentId });
          strapi.log.info(`[scheduled-publish] published ${uid} ${doc.documentId}`);
        }
      }
    } catch (e) {
      strapi.log.error(`[scheduled-publish] ${uid}: ${e.message}`);
    }
  }
};
