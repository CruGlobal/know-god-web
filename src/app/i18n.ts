import { ITranslationService } from 'angular-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

export function appInit(i18next: ITranslationService) {
  return () =>
    i18next
      .use(Backend)
      .use(LanguageDetector)
      .init({
        nsSeparator: false,
        keySeparator: false,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false
        },
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag']
        },
        backend: {
          loadPath: '/assets/locales/{{lng}}/translation.json'
        }
      });
}
