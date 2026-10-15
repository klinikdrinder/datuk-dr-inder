const cronTasks = require('./cron-tasks');

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', ''),          // e.g. https://cms.datukdrinder.com
  proxy: { koa: env.bool('IS_PROXIED', true) },
  app: { keys: env.array('APP_KEYS') },
  webhooks: { populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false) },
  cron: { enabled: env.bool('CRON_ENABLED', true), tasks: cronTasks },
});
