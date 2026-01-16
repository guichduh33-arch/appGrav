import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';

i18n
    // detect user language
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    .init({
        resources: {
            en: {
                translation: en
            },
            fr: {
                translation: fr
            }
        },
        lng: 'en', // Force English for now as per requirement
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false // not needed for react as it escapes by default
        }
    });

export default i18n;
