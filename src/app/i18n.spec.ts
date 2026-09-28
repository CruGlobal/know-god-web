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

const detectedLanguage = 'xx';

const fakeLanguageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  detect: () => detectedLanguage
};

// Stands in for the HTTP backend so init() runs for real without network
// requests. Languages in failingLanguages fail the same way a production
// catalogue does when CloudFront serves index.html instead of the JSON file.
function fakeBackend(failingLanguages: string[]): BackendModule {
  return {
    type: 'backend',
    init: () => {},
    read: (language, _namespace, callback) => {
      if (failingLanguages.includes(language)) {
        callback(
          `failed parsing /assets/locales/${language}/translation.json to json`,
          false
        );
      } else {
        callback(null, {});
      }
    }
  };
}

describe('appInit', () => {
  let i18next: ITranslationService;

  function useFakePlugins(backend: BackendModule): void {
    const realUse = i18next.use.bind(i18next);
    type Plugin = Parameters<typeof realUse>[0];
    spyOn(i18next, 'use').and.callFake((plugin: Plugin) => {
      if (plugin === Backend) {
        return realUse(backend);
      }
      if (plugin === LanguageDetector) {
        return realUse(fakeLanguageDetector);
      }
      return realUse(plugin);
    });
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

  it('logs an error when a catalogue fails to load during init', async () => {
    useFakePlugins(fakeBackend([detectedLanguage]));

    await appInit(i18next)();

    expect(console.error).toHaveBeenCalledOnceWith(
      'Failed to load the "translation" translations for "xx": failed parsing /assets/locales/xx/translation.json to json'
    );
  });

  it('does not log an error when every catalogue loads', async () => {
    useFakePlugins(fakeBackend([]));

    await appInit(i18next)();

    expect(i18next.language).toBe(detectedLanguage);
    expect(console.error).not.toHaveBeenCalled();
  });
});
