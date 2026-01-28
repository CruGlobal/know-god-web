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
import {
  TractPage,
  godToolsParser
} from '../services/xml-parser-service/xml-parser.service';
import { PageComponent, getResourceTypeEnum } from './page.component';
import { PageService } from './service/page-service.service';

describe('PageComponent', () => {
  let component: PageComponent;
  let fixture: ComponentFixture<PageComponent>;
  let pageService: PageService;
  let router: Router;
  const bookId = 'fourlaws',
    langId = 'en',
    toolType = 'tool',
    resourceType = 'v2',
    pageId = 0;
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
  const cyoaPage = Object.create(
    godToolsParser.model.page.ContentPage.prototype
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
      langId,
      bookId,
      toolType,
      resourceType,
      pageId
    };
    // Create proper page objects for the manifest
    component._pageBookSubPagesManifest = [0, 1, 2, 3, 4, 5, 6].map((pos) => ({
      position: pos,
      isHidden: false,
      id: String(pos),
      listeners: [],
      dismissListeners: []
    }));
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
    expect(router.navigate).toHaveBeenCalledWith([
      'de',
      toolType,
      resourceType,
      bookId,
      pageId
    ]);
  });

  it('onToggleLanguageSelect()', () => {
    component.languagesVisible = false;
    component.onToggleLanguageSelect();
    expect(component.languagesVisible).toBeTrue();
  });

  it('onToggleLanguageSelect()', () => {
    component.languagesVisible = false;
    component.onToggleLanguageSelect();
    expect(component.languagesVisible).toBeTrue();
  });

  it('onPreviousPage() on page 0', () => {
    component.onPreviousPage();
    expect(router.navigate).toHaveBeenCalledTimes(0);
  });
  it('should not navigate onPreviousPage() on CYOA page', () => {
    component._pageParams = {
      langId,
      bookId,
      toolType,
      resourceType,
      pageId: 'end'
    };
    component?.onPreviousPage();
    expect(router.navigate).toHaveBeenCalledTimes(0);
  });
  it('onPreviousPage() on page > 0', () => {
    component._pageParams = {
      langId,
      bookId,
      toolType,
      resourceType,
      pageId: 5
    };
    component.onPreviousPage();
    expect(router.navigate).toHaveBeenCalledWith([
      langId,
      toolType,
      resourceType,
      bookId,
      4
    ]);
  });

  it('onNextPage() on page 0', () => {
    component.onNextPage();
    expect(router.navigate).toHaveBeenCalledWith([
      langId,
      toolType,
      resourceType,
      bookId,
      1
    ]);
  });
  it('onNextPage() on final page', () => {
    component._pageParams = {
      langId,
      bookId,
      toolType,
      resourceType,
      pageId: 6
    };
    component.onNextPage();
    expect(router.navigate).toHaveBeenCalledTimes(0);
  });
  it('should not navigate onNextPage() on CYOA page', () => {
    component.activePage = cyoaPage;

    component._pageParams = {
      langId,
      bookId,
      toolType,
      resourceType,
      pageId: 0
    };
    component?.onNextPage();
    expect(router.navigate).toHaveBeenCalledTimes(0);
  });

  describe('getResource()', () => {
    const file2Name = 'file-name-2.png';
    const file2Url = 'https://cru.org/assets/file-name-2.png';
    it('should fetch an image', async () => {
      await component.getResource(getResourceTypeEnum.image, file2Name);
      expect(pageService.getAllImages()[file2Name]).toEqual(file2Url);
    });

    it('should fetch an animation', async () => {
      const addToAnimationsDictSpy = spyOn(pageService, 'addToAnimationsDict');
      const fileUrl = await component.getResource(
        getResourceTypeEnum.animation,
        file2Name
      );
      expect(addToAnimationsDictSpy).toHaveBeenCalledWith(file2Name, file2Url);
      expect(fileUrl).toEqual(file2Url);
    });

    it('should not download resource', async () => {
      spyOn(pageService, 'getAllImages');
      await component.getResource(getResourceTypeEnum.image, 'file-name-3.png');
      expect(pageService.getAllImages).toHaveBeenCalledTimes(0);
    });
  });

  describe('loadBookPage()', () => {
    it('does not call showPage', async () => {
      component.loadBookPage(tractPage);
      const showPageSpy = spyOn(component, 'showPage');
      expect(showPageSpy).toHaveBeenCalledTimes(0);
    });

    it('calls showPage', async () => {
      const showPageSpy = spyOn(component, 'showPage');
      component.loadBookPage(tractPageOne);
      expect(showPageSpy).toHaveBeenCalledTimes(1);
    });

    interface TestProps {
      testName: string;
      pageId: string;
      initialPageId: string | null;
      page: Partial<TractPage>;
    }
    const tests: TestProps[] = [
      {
        testName: 'pageId,',
        pageId: '0',
        initialPageId: null,
        page: tractPage
      },
      {
        testName: 'pageId',
        pageId: 'intro',
        initialPageId: null,
        page: tractPage
      },
      {
        testName: 'pageId',
        pageId: 'page-id-123',
        initialPageId: '0',
        page: cyoaPage
      }
    ];

    tests.forEach(({ testName, pageId, initialPageId, page }) => {
      it(testName, async () => {
        const navigateByUrlSpy = spyOn(router, 'navigateByUrl');
        const pageWithRealId = {
          ...page,
          id: pageId,
          position: 0
        };
        component._pageParams.pageId = initialPageId;

        spyOn(component, 'getPageIdForRouting').and.returnValue(pageId);

        component.loadBookPage(pageWithRealId as TractPage);

        expect(navigateByUrlSpy).toHaveBeenCalledWith(
          router.createUrlTree([
            langId,
            toolType,
            resourceType,
            bookId,
            pageId
          ]),
          { replaceUrl: true }
        );
      });
    });
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
    component._pageParams.bookId = 'connectingWithGod';
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
    component._pageBookManifestLoaded = true;
    component._pageBookManifest = { test: true };
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
    expect(component._pageBookManifestLoaded).toEqual(false);
    expect(component._pageBookManifest).toEqual({});
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

  describe('setCardUrl()', () => {
    const setupSetCardUrlTest = (langId: string | null) => {
      component._pageParams.langId = langId;
    };

    it('should navigate with correct params', () => {
      setupSetCardUrlTest(langId);
      component.setCardUrl(2);

      expect(router.navigate).toHaveBeenCalledWith([
        langId,
        toolType,
        resourceType,
        bookId,
        pageId,
        2
      ]);
    });

    it('should not navigate if _pageParams.langId is missing', () => {
      setupSetCardUrlTest(null);

      component.setCardUrl(2);

      expect(router.navigate).not.toHaveBeenCalled();
    });
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
        langId,
        bookId,
        toolType,
        resourceType,
        pageId: '1'
      };
      component._pageBookSubPagesManifest = [
        tractPageOne,
        tractPageWithListeners
      ];
      component.awaitPageEvent();
      onNextPageSpy = spyOn(component, 'onNextPage');
    });

    it('should navigate to page 5', () => {
      pageService.contentEvent('another-page-event');

      expect(router.navigate).toHaveBeenCalledWith([
        'en',
        toolType,
        resourceType,
        bookId,
        5
      ]);
    });

    it('should not navigate to new page', () => {
      pageService.formAction('card-event');

      expect(router.navigate).not.toHaveBeenCalled();
      expect(onNextPageSpy).not.toHaveBeenCalled();
    });

    it('should navigate to the next page (1)', () => {
      pageService.addToNavigationStack('1');
      pageService.addToNavigationStack('5');
      pageService.contentEvent('dismiss-event');

      expect(router.navigate).toHaveBeenCalledWith([
        'en',
        toolType,
        resourceType,
        bookId,
        '1'
      ]);

      expect(onNextPageSpy).toHaveBeenCalled();
    });

    it('should navigate to the dashboard on manifest-level dismiss event', () => {
      component._pageBookSubPages = [tractPage];
      component._pageBookSubPagesManifest = [tractPage];
      component._pageBookManifest = {
        dismissListeners: [{ name: 'close-tool' }]
      };
      component.awaitPageEvent();

      pageService.contentEvent('close-tool');

      expect(router.navigate).toHaveBeenCalledWith([
        component._pageParams.langId
      ]);
    });
  });

  describe('awaitPageNavigation() - onNavigateToPage()', () => {
    let addToNavigationStackSpy;

    beforeEach(() => {
      component._pageParams = {
        langId,
        bookId,
        toolType,
        resourceType,
        pageId: 1
      };
      component._pageBookSubPages = [tractPageOne, tractPage];
      component.awaitPageNavigation();
      addToNavigationStackSpy = spyOn(pageService, 'addToNavigationStack');
    });

    it('should navigate to page 8', async () => {
      pageService.navigateToPage(8);

      waitForAsync(() => {
        expect(addToNavigationStackSpy).toHaveBeenCalledWith(8);

        expect(router.navigate).toHaveBeenCalledWith([
          langId,
          toolType,
          resourceType,
          bookId,
          8
        ]);
      });
    });
  });

  describe('getPageIdForRouting() — CYOA handling', () => {
    const setupGetPageIdForRoutingTest = (pageId: string, activePage: any) => {
      component._pageParams.pageId = pageId;
      component.activePage = activePage;
    };

    it('returns page.id if activePage is CYOA and page.position is 0 and route pageId is "0"', () => {
      setupGetPageIdForRoutingTest('0', cyoaPage);

      const result = component.getPageIdForRouting({
        id: 'cyoa-real-id',
        position: 0
      });

      expect(result).toBe('cyoa-real-id');
    });

    it('returns page.position if activePage is NOT CYOA even if pageId is "0"', () => {
      setupGetPageIdForRoutingTest('0', {});

      const result = component.getPageIdForRouting({
        id: 'some-id',
        position: 0
      });

      expect(result).toBe(0);
    });
  });

  describe('cleanPageId()', () => {
    const setupCleanPageIdTest = (pageId: string | number) => {
      component._pageParams.pageId = pageId;
    };

    it('should return number if pageId is numeric string', () => {
      setupCleanPageIdTest('3');
      expect(component['cleanPageId']()).toBe(3);
    });

    it('should return string if pageId is non-numeric', () => {
      setupCleanPageIdTest('abc');
      expect(component['cleanPageId']()).toBe('abc');
    });

    it('should return number if pageId is already a number', () => {
      setupCleanPageIdTest(5);
      expect(component['cleanPageId']()).toBe(5);
    });
  });
});
