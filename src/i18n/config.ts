import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
// Updated: 2026-01-09 - Added dialogs namespace
import commonEN from '@/locales/en/common.json';
import authEN from '@/locales/en/auth.json';
import dashboardEN from '@/locales/en/dashboard.json';
import notebookEN from '@/locales/en/notebook.json';
import profileEN from '@/locales/en/profile.json';
import errorsEN from '@/locales/en/errors.json';
import toastsEN from '@/locales/en/toasts.json';
import dialogsEN from '@/locales/en/dialogs.json';
import pricingEN from '@/locales/en/pricing.json';
import landingEN from '@/locales/en/landing.json';

import commonPL from '@/locales/pl/common.json';
import authPL from '@/locales/pl/auth.json';
import dashboardPL from '@/locales/pl/dashboard.json';
import notebookPL from '@/locales/pl/notebook.json';
import profilePL from '@/locales/pl/profile.json';
import errorsPL from '@/locales/pl/errors.json';
import toastsPL from '@/locales/pl/toasts.json';
import dialogsPL from '@/locales/pl/dialogs.json';
import pricingPL from '@/locales/pl/pricing.json';
import landingPL from '@/locales/pl/landing.json';

const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    dashboard: dashboardEN,
    notebook: notebookEN,
    profile: profileEN,
    errors: errorsEN,
    toasts: toastsEN,
    dialogs: dialogsEN,
    pricing: pricingEN,
    landing: landingEN,
  },
  pl: {
    common: commonPL,
    auth: authPL,
    dashboard: dashboardPL,
    notebook: notebookPL,
    profile: profilePL,
    errors: errorsPL,
    toasts: toastsPL,
    dialogs: dialogsPL,
    pricing: pricingPL,
    landing: landingPL,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'notebook', 'profile', 'errors', 'toasts', 'dialogs', 'pricing', 'landing'],

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
