module.exports = ({ env }) => ({
  auth: { secret: env('ADMIN_JWT_SECRET') },
  apiToken: { salt: env('API_TOKEN_SALT') },
  transfer: { token: { salt: env('TRANSFER_TOKEN_SALT') } },
  secrets: { encryptionKey: env('ENCRYPTION_KEY') },
  url: env('ADMIN_PATH', '/admin'),
  flags: { nps: false, promoteEE: false, docLinks: env.bool('FLAG_DOC_LINKS', false) },
});
