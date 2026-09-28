import { TestBed } from '@angular/core/testing';
import {
  I18NEXT_SERVICE,
  I18NextModule,
  ITranslationService
} from 'angular-i18next';
import { appInit } from './i18n';

describe('appInit', () => {
  let i18next: ITranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18NextModule.forRoot()]
    });
    i18next = TestBed.inject(I18NEXT_SERVICE);
    spyOn(i18next, 'use').and.returnValue(i18next);
    spyOn(console, 'error');
  });

  it('logs an error when a catalogue fails to load during init', async () => {
    spyOn(i18next, 'init').and.callFake(() => {
      i18next.events.failedLoading.next({
        lng: 'xx',
        ns: 'translation',
        msg: 'failed parsing /assets/locales/xx/translation.json to json'
      });
      return Promise.resolve({ err: null });
    });

    await appInit(i18next)();

    expect(console.error).toHaveBeenCalledOnceWith(
      'Failed to load the "translation" translations for "xx": failed parsing /assets/locales/xx/translation.json to json'
    );
  });

  it('does not log an error when every catalogue loads', async () => {
    spyOn(i18next, 'init').and.resolveTo({ err: null });

    await appInit(i18next)();

    expect(i18next.init).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
  });
});
