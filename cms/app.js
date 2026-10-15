'use strict';
/**
 * Startup file for cPanel Application Manager (Phusion Passenger).
 * Passenger runs this file; Strapi then serves the admin and the API.
 */
process.chdir(__dirname);
const { createStrapi } = require('@strapi/strapi');
createStrapi({ appDir: __dirname, distDir: __dirname }).start();
