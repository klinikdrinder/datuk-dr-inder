'use strict';
/**
 * Routes used only by the website server (Vercel).
 * Form posts are protected by the shared FORM_SECRET header; exports by EXPORT_KEY.
 */
module.exports = {
  routes: [
    { method: 'POST', path: '/website/enquiry', handler: 'website.enquiry', config: { auth: false } },
    { method: 'POST', path: '/website/register', handler: 'website.register', config: { auth: false } },
    { method: 'GET', path: '/website/instagram', handler: 'website.instagram', config: { auth: false } },
    { method: 'GET', path: '/exports/registrations', handler: 'website.exportRegistrations', config: { auth: false } },
    { method: 'GET', path: '/exports/enquiries', handler: 'website.exportEnquiries', config: { auth: false } },
  ],
};
