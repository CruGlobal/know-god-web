import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  createEventId,
  mockPageComponent,
  mockTractPage
} from '../_tests/mocks';
import { CommonService } from '../services/common.service';
import { LoaderService } from '../services/loader-service/loader.service';
import { PageComponent } from './page.component';
import { PageService } from './service/page-service.service';

describe('PageComponent', () => {
  let component: any;
  let fixture: ComponentFixture<PageComponent>;
  let pageService: PageService;
  let router: Router;
  const bookid = 'fourlaws',
    langid = 'en',
    pageid = 0;
  const tractPage = mockTractPage(
    false,
    '2',
    'headerText',
    'heroText',
    'callToActionText',
    'cardLabel',
    'modalTitle',
    1
  );
  const tractPageOne = mockTractPage(
    false,
    '2',
    'headerText',
    'heroText',
    'callToActionText',
    'cardLabel',
    'modalTitle',
    0
  );

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [PageComponent],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        CommonService,
        LoaderService,
        { provide: PageService, useValue: pageService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageComponent);
    router = TestBed.get(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(router, 'navigate');

    component._pageParams = {
      langid,
      bookid,
      pageid
    };
    component._pageBookSubPagesManifest = [0, 1, 2, 3, 4, 5, 6];
    component._pageBookIndex = mockPageComponent.pageBookIndex;
    component._pageBookTranslations = mockPageComponent.pageBookTranslations;
    component._allLanguages = [
      mockPageComponent.languageEnglish,
      mockPageComponent.languageGerman
    ];
    component._books = mockPageComponent.books;
  });

  it('Create component', () => {
    expect(component).toBeTruthy();
  });

  it('selectLanguage()', () => {
    component.selectLanguage({ attributes: { code: 'de' } });
    expect(router.navigate).toHaveBeenCalledWith(['de', bookid, pageid]);
  });

  it('onToggleLanaguageSelect()', () => {
    component.languagesVisible = false;
    component.onToggleLanaguageSelect();
    expect(component.languagesVisible).toBeTrue();
  });

  it('onToggleLanaguageSelect()', () => {
    component.languagesVisible = false;
    component.onToggleLanaguageSelect();
    expect(component.languagesVisible).toBeTrue();
  });

  it('onPreviousPage() on page 0', () => {
    component.onPreviousPage();
    expect(router.navigate).toHaveBeenCalledTimes(0);
  });
  it('onPreviousPage() on page > 0', () => {
    component._pageParams = {
      langid,
      bookid,
      pageid: 5
    };
    component.onPreviousPage();
    expect(router.navigate).toHaveBeenCalledWith([langid, bookid, 4]);
  });

  it('onNextPage() on page 0', () => {
    component.onNextPage();
    expect(router.navigate).toHaveBeenCalledWith([langid, bookid, 1]);
  });
  it('onNextPage() on final page', () => {
    component._pageParams = {
      langid,
      bookid,
      pageid: 6
    };
    component.onNextPage();
    expect(router.navigate).toHaveBeenCalledTimes(0);
  });

  it('getImage()', async () => {
    await component.getImage('file-name-2.png');
    expect(pageService.getAllImages()['file-name-2.png']).toEqual(
      'https://cru.org/assets/file-name-2.png'
    );
  });

  it('getImage() resource not downloaded', async () => {
    spyOn(pageService, 'getAllImages');
    await component.getImage('file-name-3.png');
    expect(pageService.getAllImages).toHaveBeenCalledTimes(0);
  });

  it('loadBookPage() - wrong page', async () => {
    component.loadBookPage(tractPage);
    const showPageSpy = spyOn(component, 'showPage');
    expect(showPageSpy).toHaveBeenCalledTimes(0);
  });

  it('loadBookPage() - correct page', async () => {
    const showPageSpy = spyOn(component, 'showPage');
    component.loadBookPage(tractPageOne);
    expect(showPageSpy).toHaveBeenCalledTimes(1);
  });

  it('getAvailableLanguagesForSelectedBook() no languages downloaded', () => {
    component._allLanguages = [];
    expect(component.availableLanguages).toEqual([]);
    component.getAvailableLanguagesForSelectedBook();
    expect(component.availableLanguages).toEqual([]);
  });

  it('getAvailableLanguagesForSelectedBook()', () => {
    expect(component.availableLanguages).toEqual([]);
    component.getAvailableLanguagesForSelectedBook();
    expect(component.availableLanguages.length).toEqual(1);
  });

  it('loadPageBook()', () => {
    const loadPageBookIndexSpy = spyOn(component, 'loadPageBookIndex');
    component.loadPageBook();
    expect(component._pageBookLoaded).toBeTrue();
    expect(loadPageBookIndexSpy).toHaveBeenCalledTimes(1);
  });

  it('loadPageBook() - page does not exist', () => {
    const loadPageBookIndexSpy = spyOn(component, 'loadPageBookIndex');
    component._pageParams.bookid = 'connectingwithgod';
    component.loadPageBook();
    expect(component._pageBookLoaded).toBeFalse();
    expect(loadPageBookIndexSpy).toHaveBeenCalledTimes(0);
  });

  it('setSelectedLanguage()', () => {
    spyOn(pageService, 'setDir');
    component.setSelectedLanguage();
    expect(component._selectedLanguage).toEqual(
      mockPageComponent.languageEnglish
    );
    expect(component.selectedLang).toEqual(
      mockPageComponent.languageEnglish.attributes.name
    );
    expect(pageService.setDir).toHaveBeenCalledWith(
      mockPageComponent.languageEnglish.attributes.direction
    );
  });

  it('checkIfPreSelectedLanguageExists() - True', () => {
    component._selectedLanguage = mockPageComponent.languageEnglish;
    const preSelected = component.checkIfPreSelectedLanguageExists();
    expect(preSelected).toEqual('4');
  });

  it('checkIfPreSelectedLanguageExists() - False', () => {
    const preSelected = component.checkIfPreSelectedLanguageExists();
    expect(preSelected).toBeFalse();
  });

  it('clearData()', () => {
    component._booksLoaded = true;
    component._pageBookLoaded = true;
    component._pageBookMainfestLoaded = true;
    component._pageBookMainfest = { test: true };
    component._pageBookTranslationId = 10;
    component.availableLanguages = [{ lang: 'en' }];
    component.selectedBookName = 'Four Laws';
    component.languagesVisible = true;
    component.activePage = 3;
    component.activePageOrder = 3;
    component.totalPages = 5;
    component.bookNotAvailableInLanguage = true;
    component.bookNotAvailable = true;
    component.clearData();
    expect(component._booksLoaded).toEqual(false);
    expect(component._books).toEqual([]);
    expect(component._pageBookLoaded).toEqual(false);
    expect(component._pageBook).toEqual({});
    expect(component._pageBookIndex).toEqual({});
    expect(component._pageBookMainfestLoaded).toEqual(false);
    expect(component._pageBookMainfest).toEqual({});
    expect(component._pageBookTranslations).toEqual([]);
    expect(component._pageBookTranslationId).toEqual(0);
    expect(component._pageBookSubPagesManifest).toEqual([]);
    expect(component._pageBookSubPages).toEqual([]);
    expect(component.availableLanguages).toEqual([]);
    expect(component.selectedBookName).toEqual('');
    expect(component.languagesVisible).toEqual(false);
    expect(component.activePage).toEqual(null);
    expect(component.activePageOrder).toEqual(0);
    expect(component.totalPages).toEqual(0);
    expect(component.bookNotAvailableInLanguage).toEqual(false);
    expect(component.bookNotAvailable).toEqual(false);
  });

  it('showPage()', () => {
    const awaitPageNavigationSpy = spyOn(component, 'awaitPageNavigation');
    component.showPage(tractPage);
    expect(component.activePageOrder).toBe(tractPage.position);
    expect(component.activePage).toBe(tractPage);
    expect(awaitPageNavigationSpy).toHaveBeenCalled();
    setTimeout(() => {
      expect(component.pagesLoaded).toBe(true);
    }, 0);
  });

  describe('awaitPageEvent()', () => {
    const tractPageWithListeners = mockTractPage(
      false,
      '0',
      'headerText',
      'heroText',
      'callToActionText',
      'cardLabel',
      'modalTitle',
      5,
      [
        createEventId('page-event', null),
        createEventId('another-page-event', null)
      ],
      [createEventId('dismiss-event', null)]
    );
    let onNextPageSpy;

    beforeEach(() => {
      component._pageParams = {
        langid,
        bookid,
        pageid: 1
      };
      component._pageBookSubPages = [tractPageOne, tractPageWithListeners];
      component.awaitPageEvent();
      onNextPageSpy = spyOn(component, 'onNextPage');
    });

    it('should navigate to page 8', () => {
      pageService.formAction('another-page-event');

      expect(router.navigate).toHaveBeenCalledWith(['en', bookid, 5]);
    });

    it('should not navigate to new page', () => {
      pageService.formAction('card-event');

      expect(router.navigate).not.toHaveBeenCalled();
      expect(onNextPageSpy).not.toHaveBeenCalled();
    });

    it('should navigate to the next page (2)', () => {
      pageService.formAction('dismiss-event');

      expect(router.navigate).not.toHaveBeenCalled();
      expect(onNextPageSpy).toHaveBeenCalled();
    });
  });
});
