import { TestBed } from '@angular/core/testing';
import {
  I18NEXT_INSTANCE,
  I18NEXT_SERVICE,
  I18NextModule,
  ITranslationService
} from 'angular-i18next';
import i18nextGlobal, { BackendModule, LanguageDetectorModule } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { appInit } from './i18n';

function fakeLanguageDetector(language: string): LanguageDetectorModule {
  return { type: 'languageDetector', detect: () => language };
}

// Stands in for the HTTP backend so init() runs for real without network
// requests. Languages not in availableLanguages fail the same way a
// production catalogue does when CloudFront serves index.html instead.
function fakeBackend(availableLanguages: string[]): BackendModule {
  return {
    type: 'backend',
    init: () => {},
    read: (language, _namespace, callback) => {
      if (availableLanguages.includes(language)) {
        callback(null, { Tools: `Tools (${language})` });
      } else {
        callback(
          `failed parsing /assets/locales/${language}/translation.json to json`,
          false
        );
      }
    }
  };
}

describe('appInit', () => {
  let i18next: ITranslationService;

  async function initWith(
    detectedLanguage: string,
    availableLanguages: string[]
  ): Promise<void> {
    const realUse = i18next.use.bind(i18next);
    type Plugin = Parameters<typeof realUse>[0];
    spyOn(i18next, 'use').and.callFake((plugin: Plugin) => {
      if (plugin === Backend) {
        return realUse(fakeBackend(availableLanguages));
      }
      if (plugin === LanguageDetector) {
        return realUse(fakeLanguageDetector(detectedLanguage));
      }
      return realUse(plugin);
    });
    await appInit(i18next)();
  }

  function loggedErrors(): string[] {
    return (console.error as jasmine.Spy).calls
      .allArgs()
      .map(([message]) => message);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18NextModule.forRoot()],
      // A fresh instance keeps init() from touching the global i18next that
      // other specs share.
      providers: [
        { provide: I18NEXT_INSTANCE, useValue: i18nextGlobal.createInstance() }
      ]
    });
    i18next = TestBed.inject(I18NEXT_SERVICE);
    spyOn(console, 'error');
  });

  it('does not log when en-US is missing and en loads', async () => {
    await initWith('en-US', ['en']);

    expect(i18next.resolvedLanguage).toBe('en');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('does not log when fr-FR is missing and fr loads', async () => {
    await initWith('fr-FR', ['fr', 'en']);

    expect(i18next.resolvedLanguage).toBe('fr');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('logs one error when es fails and the UI falls back to en', async () => {
    await initWith('es', ['en']);

    expect(loggedErrors()).toEqual([
      'Failed to load the "es" translations, so the UI is in English. es/translation: failed parsing /assets/locales/es/translation.json to json'
    ]);
  });

  it('logs one error naming zh-CN and zh when both fail', async () => {
    await initWith('zh-CN', ['en']);

    const errors = loggedErrors();
    expect(errors).toHaveSize(1);
    expect(errors[0]).toContain('"zh-CN"');
    expect(errors[0]).toContain('zh-CN/translation: failed parsing');
    expect(errors[0]).toContain('zh/translation: failed parsing');
  });

  it('logs one error when a later language change falls back to en', async () => {
    await initWith('en', ['en']);
    expect(console.error).not.toHaveBeenCalled();

    await i18next.changeLanguage('de');

    const errors = loggedErrors();
    expect(errors).toHaveSize(1);
    expect(errors[0]).toContain('"de"');
    expect(errors[0]).toContain('de/translation: failed parsing');
  });

  it('logs one error when even the English fallback fails', async () => {
    await initWith('en', []);

    const errors = loggedErrors();
    expect(errors).toHaveSize(1);
    expect(errors[0]).toContain('en/translation: failed parsing');
  });
});
