import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flushMicrotasks,
  tick
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { I18NextModule } from 'angular-i18next';
import { of } from 'rxjs';
import { mockManifestTranslation, mockPageComponent } from '../_tests/mocks';
import { APIURL } from '../api/url';
import { CommonService } from '../services/common.service';
import { LoaderService } from '../services/loader-service/loader.service';
import {
  ManifestParser,
  XmlParserData,
  godToolsParser
} from '../services/xml-parser-service/xml-parser.service';
import { PageComponent } from './page.component';
import { PageService } from './service/page-service.service';

const failedLoadText = 'Failed to load the book.';
const notInLanguageText =
  "This book isn't available in the currently selected language.";
const serverError = { status: 500, statusText: 'Server Error' };

describe('PageComponent loading errors', () => {
  let component: PageComponent;
  let fixture: ComponentFixture<PageComponent>;
  let httpMock: HttpTestingController;
  let loaderService: LoaderService;

  const headingWithText = (text: string): HTMLElement | null =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('h2')
    ).find((heading) => heading.textContent.trim() === text) ?? null;
  const failedLoadMessage = (): HTMLElement | null =>
    headingWithText(failedLoadText);

  // Run the ngOnInit load chain up to the first request (the languages list).
  const startLoading = () => {
    fixture.detectChanges();
    tick();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageComponent],
      imports: [FormsModule, RouterTestingModule, I18NextModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CommonService,
        LoaderService,
        PageService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              langId: 'en',
              toolType: 'tool',
              resourceType: 'v1',
              bookId: 'fourlaws',
              page: '0'
            }),
            queryParams: of({}),
            snapshot: { queryParams: {} }
          }
        }
      ]
    });
    fixture = TestBed.createComponent(PageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    loaderService = TestBed.inject(LoaderService);
  });

  it('shows the failed state when the languages request fails', fakeAsync(() => {
    startLoading();

    httpMock.expectOne(APIURL.GET_ALL_LANGUAGES).flush(null, serverError);
    fixture.detectChanges();

    expect(component.bookNotAvailable).toBeTrue();
    expect(loaderService.status.value).toBeFalse();
    expect(failedLoadMessage()).not.toBeNull();
  }));

  it('shows the failed state when the books request fails', fakeAsync(() => {
    startLoading();

    httpMock
      .expectOne(APIURL.GET_ALL_LANGUAGES)
      .flush({ data: [mockPageComponent.languageEnglish] });
    httpMock.expectOne(APIURL.GET_ALL_BOOKS).flush(null, serverError);
    fixture.detectChanges();

    expect(component.bookNotAvailable).toBeTrue();
    expect(loaderService.status.value).toBeFalse();
    expect(failedLoadMessage()).not.toBeNull();
  }));

  it('shows the failed state when the book index request fails', fakeAsync(() => {
    startLoading();

    httpMock
      .expectOne(APIURL.GET_ALL_LANGUAGES)
      .flush({ data: [mockPageComponent.languageEnglish] });
    httpMock
      .expectOne(APIURL.GET_ALL_BOOKS)
      .flush({ data: mockPageComponent.books });
    httpMock
      .expectOne(APIURL.GET_INDEX_FILE.replace('{0}', '1'))
      .flush(null, serverError);
    fixture.detectChanges();

    expect(component.bookNotAvailable).toBeTrue();
    expect(loaderService.status.value).toBeFalse();
    expect(failedLoadMessage()).not.toBeNull();
  }));

  describe('loadBookManifestXML()', () => {
    // Set up a translation with a manifest after ngOnInit has cleared the data.
    const startManifestLoad = () => {
      startLoading();
      component['_selectedLanguage'] = mockPageComponent.languageEnglish;
      component['_pageBookTranslations'] = [mockManifestTranslation];
      component['loadBookManifestXML']();
    };

    it('shows the failed state when the manifest parse rejects', fakeAsync(() => {
      spyOn(ManifestParser.prototype, 'parseManifest').and.callFake(() =>
        Promise.reject(new Error('Http failure response'))
      );

      startManifestLoad();
      flushMicrotasks();
      fixture.detectChanges();

      expect(component.bookNotAvailable).toBeTrue();
      expect(loaderService.status.value).toBeFalse();
      expect(failedLoadMessage()).not.toBeNull();
    }));

    it('shows the failed state when the parse finishes with a ParserError', fakeAsync(() => {
      const parserError = Object.create(
        godToolsParser.ParserResult.ParserError.prototype
      );
      spyOn(ManifestParser.prototype, 'parseManifest').and.resolveTo(
        parserError
      );

      startManifestLoad();
      flushMicrotasks();
      fixture.detectChanges();

      expect(component.bookNotAvailable).toBeTrue();
      expect(loaderService.status.value).toBeFalse();
      expect(failedLoadMessage()).not.toBeNull();
    }));

    it('does not show the failed state when rendering the parsed manifest throws', fakeAsync(() => {
      // Reading the manifest's related files throws after the parse succeeded.
      const relatedFiles = {
        asJsReadonlySetView: () => {
          throw new Error('Render failed');
        }
      };
      spyOn(ManifestParser.prototype, 'parseManifest').and.resolveTo({
        manifest: { relatedFiles, pages: [] }
      } as unknown as XmlParserData);

      startManifestLoad();
      // The render error is left unhandled instead of being reported as a
      // failed load.
      expect(() => flushMicrotasks()).toThrowError(/Render failed/);
      fixture.detectChanges();

      expect(component.bookNotAvailable).toBeFalse();
      expect(failedLoadMessage()).toBeNull();
    }));

    it('hides the loader when the manifest has no pages', fakeAsync(() => {
      spyOn(ManifestParser.prototype, 'parseManifest').and.resolveTo({
        manifest: { relatedFiles: null, pages: [] }
      } as unknown as XmlParserData);

      startManifestLoad();
      flushMicrotasks();
      fixture.detectChanges();

      expect(component.bookNotAvailableInLanguage).toBeTrue();
      expect(component.bookNotAvailable).toBeFalse();
      expect(loaderService.status.value).toBeFalse();
      expect(headingWithText(notInLanguageText)).not.toBeNull();
    }));

    it('does not show the failed state when a newer load aborts the parse', fakeAsync(() => {
      let parseSignal: AbortSignal;
      spyOn(ManifestParser.prototype, 'parseManifest').and.callFake(
        (_fileName: string, signal: AbortSignal) => {
          parseSignal = signal;
          return new Promise<XmlParserData>((_resolve, reject) => {
            signal.addEventListener('abort', () => {
              reject(new Error('Parse cancelled'));
            });
          });
        }
      );

      startManifestLoad();
      component['clearData']();
      flushMicrotasks();
      fixture.detectChanges();

      expect(parseSignal.aborted).toBeTrue();
      expect(component.bookNotAvailable).toBeFalse();
      expect(loaderService.status.value).toBeTrue();
      expect(failedLoadMessage()).toBeNull();
    }));
  });
});
