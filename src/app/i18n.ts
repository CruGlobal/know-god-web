import { ITranslationService } from 'angular-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const FALLBACK_LANGUAGE = 'en';

type FailedLoadingEvent = { lng: string; ns: string; msg: string };

function reportFallbackToEnglish(i18next: ITranslationService): void {
  let failures: FailedLoadingEvent[] = [];
  i18next.events.failedLoading.subscribe((failure: FailedLoadingEvent) => {
    failures.push(failure);
  });

  // Missing regional files (en-US) are normal; only report a real fall back to English.
  // languageChanged fires after loading, once resolvedLanguage is set.
  i18next.events.languageChanged.subscribe((language) => {
    if (language === null) {
      return;
    }
    const { resolvedLanguage } = i18next;
    const showsRequestedLanguage =
      resolvedLanguage !== undefined &&
      (resolvedLanguage !== FALLBACK_LANGUAGE ||
        language.split('-')[0] === FALLBACK_LANGUAGE);
    if (!showsRequestedLanguage && failures.length > 0) {
      const details = failures
        .map(({ lng, ns, msg }) => `${lng}/${ns}: ${msg}`)
        .join('; ');
      console.error(
        `Failed to load the "${language}" translations, so the UI is in English. ${details}`
      );
    }
    failures = [];
  });
}

export function appInit(i18next: ITranslationService) {
  return () => {
    reportFallbackToEnglish(i18next);

    return i18next
      .use(Backend)
      .use(LanguageDetector)
      .init({
        nsSeparator: false,
        keySeparator: false,
        fallbackLng: FALLBACK_LANGUAGE,
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
