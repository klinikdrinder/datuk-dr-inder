const config = {
  locales: [],
  head: { favicon: undefined },
  theme: {
    light: {
      colors: {
        primary100: '#fbeef0', primary200: '#f3c6cd', primary500: '#d33a52',
        primary600: '#C8102E', primary700: '#8E0E22',
        buttonPrimary500: '#d33a52', buttonPrimary600: '#C8102E',
      },
    },
  },
  translations: {
    en: {
      'Auth.form.welcome.title': 'Datuk Dr Inder — Website Admin',
      'Auth.form.welcome.subtitle': 'Log in to update seminars, the journal, photos and enquiries.',
      'app.components.LeftMenu.navbrand.title': 'Datuk Dr Inder',
      'app.components.LeftMenu.navbrand.workplace': 'Website admin',
    },
  },
  tutorials: false,
  notifications: { releases: false },
};

const bootstrap = () => {
  document.title = 'Datuk Dr Inder — Admin';
};

export default { config, bootstrap };
