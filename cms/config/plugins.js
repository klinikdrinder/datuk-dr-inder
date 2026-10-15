const allowedMediaTypes = ['image/*', 'video/*', 'application/pdf', 'text/plain', 'text/csv'];
const deniedTypes = [
  'image/svg+xml', 'application/vnd.microsoft.portable-executable', 'application/x-msdownload',
  'application/x-msdos-program', 'application/x-executable', 'application/x-dosexec',
  'application/x-sh', 'text/x-shellscript', 'application/x-mach-binary',
];

module.exports = ({ env }) => ({
  'users-permissions': {
    config: { jwtManagement: 'refresh', sessions: { httpOnly: true } },
  },
  upload: {
    config: {
      sizeLimit: 60 * 1024 * 1024,
      breakpoints: { xlarge: 1920, large: 1200, medium: 750, small: 480 },
      security: { allowedTypes: allowedMediaTypes, deniedTypes },
    },
  },
  // Email alerts for new enquiries / registrations (uses a cPanel mailbox, e.g. noreply@datukdrinder.com)
  ...(env('SMTP_HOST')
    ? {
        email: {
          config: {
            provider: 'nodemailer',
            providerOptions: {
              host: env('SMTP_HOST'),
              port: env.int('SMTP_PORT', 465),
              secure: env.bool('SMTP_SECURE', true),
              auth: { user: env('SMTP_USERNAME'), pass: env('SMTP_PASSWORD') },
            },
            settings: {
              defaultFrom: env('SMTP_FROM', 'noreply@datukdrinder.com'),
              defaultReplyTo: env('SMTP_FROM', 'noreply@datukdrinder.com'),
            },
          },
        },
      }
    : {}),
});
