import { ITranslationService } from 'angular-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

type FailedLoadingEvent = { lng: string; ns: string; msg: string };

export function appInit(i18next: ITranslationService) {
  return () => {
    // i18next only reports a catalogue that fails to load or parse through its
    // debug logger, so the UI silently falls back to English. Log it as an
    // error so the failure shows up in the console and in error monitoring.
    i18next.events.failedLoading.subscribe(
      ({ lng, ns, msg }: FailedLoadingEvent) => {
        console.error(
          `Failed to load the "${ns}" translations for "${lng}": ${msg}`
        );
      }
    );

    return i18next
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
  };
}
