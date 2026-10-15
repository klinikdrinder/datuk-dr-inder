module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://*.cdninstagram.com', 'https://*.fbcdn.net'],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: env.array('CORS_ORIGINS', ['http://localhost:3000', 'https://datukdrinder.com', 'https://www.datukdrinder.com']),
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  { name: 'strapi::body', config: { formLimit: '20mb', jsonLimit: '5mb', textLimit: '5mb', formidable: { maxFileSize: 60 * 1024 * 1024 } } },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
