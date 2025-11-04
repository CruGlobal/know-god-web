import { ViewportScroller } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as ActionCable from '@rails/actioncable';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { APIURL } from '../api/url';
import { CommonService } from '../services/common.service';
import { LoaderService } from '../services/loader-service/loader.service';
import {
  Manifest,
  ManifestParser,
  Page,
  ParserConfig,
  PullParserFactory,
  ResourceType,
  TractPage,
  XmlParserData,
  godToolsParser
} from '../services/xml-parser-service/xml-parser.service';
import { IPageParameters } from './model/page-parameters';
import { PageService } from './service/page-service.service';

interface LiveShareSubscriptionPayload {
  data?: {
    type: 'navigation-event';
    id: string;
    attributes: {
      card?: number;
      locale: string;
      page: number;
      tool: string;
    };
  };
}

export enum getResourceTypeEnum {
  animation = 'animation',
  image = 'image'
}

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PageComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<void>();
  private _pageChanged = new Subject<void>();
  private _pageParams: IPageParameters;
  private _allLanguagesLoaded: boolean;
  private _allLanguages: any[];
  private _booksLoaded: boolean;
  private _books: any[];
  private _pageBookLoaded: boolean;
  private _pageBook: any;
  private _pageBookIndex: any;
  private _pageBookManifest: Manifest;
  private _pageBookManifestLoaded: boolean;
  private _pageBookTranslations: any[];
  private _pageBookTranslationId: number;
  private _pageBookSubPagesManifest: Page[];
  private _pageBookSubPages: Page[];
  private _visibleHiddenPageIds: Set<string>; // Track temporarily visible hidden pages
  private _selectedLanguage: any;
  private liveShareSubscription: ActionCable.Channel;

  pagesLoaded: boolean;
  selectedLang: string;
  availableLanguages: Array<any>;
  languagesVisible: boolean;
  resourceType: ResourceType;
  selectedBookName: string;
  activePage: any;
  activePageOrder: number;
  totalPages: number;
  bookNotAvailableInLanguage: boolean;
  bookNotAvailable: boolean;
  embedded: boolean;

  constructor(
    private loaderService: LoaderService,
    public commonService: CommonService,
    private pageService: PageService,
    private route: ActivatedRoute,
    public router: Router,
    private viewportScroller: ViewportScroller,
    private pullParserFactory: PullParserFactory
  ) {
    this._pageParams = {
      langId: '',
      toolType: '',
      bookId: ''
    };
    this._books = [];
    this.activePageOrder = 0;
    this._visibleHiddenPageIds = new Set<string>();
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.isCYOAPage()) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      this.onPreviousPage();
    } else if (event.key === 'ArrowRight') {
      this.onNextPage();
    }
  }

  ngOnInit() {
    this.awaitPageChanged();
    this.awaitPageParameters();
    this.awaitEmailFormSignupDataSubmitted();
    this.awaitLiveShareStream();
    this.route.queryParams.subscribe((queryParam) => {
      this.embedded = queryParam.embedded === 'true';
    });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this._pageChanged.complete();
    if (this.liveShareSubscription) {
      this.liveShareSubscription.unsubscribe();
    }
  }

  getPageType(): string {
    if (this.activePage instanceof godToolsParser.model.page.ContentPage) {
      return 'content';
    } else if (
      this.activePage instanceof godToolsParser.model.page.CardCollectionPage
    ) {
      return 'card-collection';
    } else {
      return '';
    }
  }

  private buildRouteParams(
    ...segments: (string | number)[]
  ): (string | number)[] {
    // For lessons (no resourceType), use: langId, 'lesson', bookId, ...rest
    // For tools (with resourceType), use: langId, 'tool', resourceType, bookId, ...rest
    const [langId, toolTypeParam, ...rest] = segments;

    if (this._pageParams.resourceType) {
      const toolType = toolTypeParam || 'tool';
      return [langId, toolType, this._pageParams.resourceType, ...rest];
    }
    const toolType = toolTypeParam || 'lesson';
    return [langId, toolType, ...rest];
  }

  setCardUrl = (card: number) => {
    if (!this._pageParams.langId) {
      return;
    }
    this.router.navigate(
      this.buildRouteParams(
        this._pageParams.langId,
        this._pageParams.toolType,
        this._pageParams.bookId,
        this.getPageIdForRouting(this.activePage),
        card
      )
    );
  };

  selectLanguage(lang): void {
    this.router.navigate(
      this.buildRouteParams(
        lang.attributes.code,
        this._pageParams.toolType,
        this._pageParams.bookId,
        this.getPageIdForRouting(this.activePage)
      )
    );
  }

  onToggleLanguageSelect(): void {
    this.languagesVisible = !this.languagesVisible;
  }

  private getVisiblePages(
    currentPosition: number,
    direction: 'next' | 'previous'
  ): Page[] {
    const pagesInDirection = this._pageBookSubPagesManifest.filter((page) =>
      direction === 'next'
        ? page.position > currentPosition
        : page.position < currentPosition
    );
    return pagesInDirection.filter(
      (page) => !page.isHidden || this._visibleHiddenPageIds.has(page.id)
    );
  }

  private onPreviousPage(): void {
    const pageId = this.cleanPageId();

    if (!this.isCYOAPage() && typeof pageId === 'number') {
      const previousVisiblePages = this.getVisiblePages(pageId, 'previous');

      if (previousVisiblePages.length > 0) {
        const previousPage =
          previousVisiblePages[previousVisiblePages.length - 1];
        this.router.navigate(
          this.buildRouteParams(
            this._pageParams.langId,
            this._pageParams.toolType,
            this._pageParams.bookId,
            previousPage.position
          )
        );
      }
    }
  }

  private onNextPage(): void {
    const pageId = this.cleanPageId();
    if (!this.isCYOAPage() && typeof pageId === 'number') {
      const nextVisiblePages = this.getVisiblePages(pageId, 'next');
      const nextVisiblePage = nextVisiblePages[0];

      if (nextVisiblePage) {
        this.router.navigate(
          this.buildRouteParams(
            this._pageParams.langId,
            this._pageParams.toolType,
            this._pageParams.bookId,
            nextVisiblePage.position
          )
        );
      }
    }
  }
  private onNavigateToPage(page: number | string): void {
    this.pageService.addToNavigationStack(String(page));
    this.router.navigate(
      this.buildRouteParams(
        this._pageParams.langId,
        this._pageParams.toolType,
        this._pageParams.bookId,
        page
      )
    );
  }

  private getResource(
    resourceType: getResourceTypeEnum,
    resourceName: string
  ): string {
    if (!resourceName) {
      return '';
    }

    if (this._pageBookIndex !== undefined && this._pageBookIndex !== null) {
      const attachments = this._pageBookIndex.included.filter(
        (row) =>
          row.type.toLowerCase() === 'attachment' &&
          row.attributes['file-file-name'].toLowerCase() ===
            resourceName.toLowerCase()
      );

      if (!attachments.length) {
        return '';
      }

      const fileUrl = attachments[0].attributes.file;
      if (resourceType === getResourceTypeEnum.animation) {
        this.pageService.addToAnimationsDict(resourceName, fileUrl);
        return fileUrl;
      } else if (resourceType === getResourceTypeEnum.image) {
        const link = document.createElement('link');
        link.href = fileUrl;
        link.rel = 'prefetch';
        document.getElementsByTagName('head')[0].appendChild(link);
        this.pageService.addToImagesDict(resourceName, fileUrl);
        return fileUrl;
      }
    }
  }

  private loadBookPage(page: TractPage): void {
    const pageId = this._pageParams.pageId;

    const showPage: boolean =
      pageId !== undefined
        ? page.position === Number(pageId) || page.id === pageId
        : page.position === 0;

    if (showPage) {
      this.showPage(page);

      // If the pageId is not set in the URL (or set to 0), we need to set
      // it using getPageIdForRouting in case it's a CYOA page and should use
      // the page.id instead of the page.position
      if (!pageId || pageId === '0') {
        const pageIdForUrl = this.getPageIdForRouting(page);

        // Only replace URL if it's not already using the real page.id
        if (String(pageIdForUrl) !== String(pageId)) {
          const urlTree = this.router.createUrlTree(
            this.buildRouteParams(
              this._pageParams.langId,
              this._pageParams.toolType,
              this._pageParams.bookId,
              pageIdForUrl
            )
          );

          this.router.navigateByUrl(urlTree, { replaceUrl: true });
        }
      }
    }
  }

  private loadBookManifestXML(): void {
    this.pageService.clear();
    let item: any = {};
    this.pullParserFactory.clearOrigin();
    this._pageBookTranslations.forEach((translation) => {
      if (
        translation?.relationships?.language?.data?.id ===
        this._selectedLanguage.id
      ) {
        item = translation;
        return;
      }
    });

    if (
      item &&
      item.id &&
      item.attributes &&
      item.attributes &&
      item.attributes['manifest-name']
    ) {
      const manifestName = item.attributes['manifest-name'];
      const translationid = item.id;
      const fileName = environment.production
        ? APIURL.GET_XML_FILES_FOR_MANIFEST + translationid + '/' + manifestName
        : APIURL.GET_XML_FILES_FOR_MANIFEST + manifestName;
      this.pullParserFactory.setOrigin(fileName);
      const config = ParserConfig.createParserConfig()
        .withLegacyWebImageResources(true)
        .withSupportedFeatures([
          ParserConfig.Companion.FEATURE_ANIMATION,
          ParserConfig.Companion.FEATURE_MULTISELECT,
          ParserConfig.Companion.FEATURE_FLOW,
          ParserConfig.Companion.FEATURE_CONTENT_CARD
        ])
        .withParseTips(false);
      const parser = new ManifestParser(this.pullParserFactory, config);
      const controller = new AbortController();
      const signal = controller.signal;
      try {
        parser.parseManifest(fileName, signal).then((data) => {
          const { manifest } = data as XmlParserData;
          this._pageBookManifest = manifest;

          // Loop through and get all resources.
          this._pageBookIndex.included.forEach((resource) => {
            const { attributes, type } = resource;
            if (type === 'attachment') {
              this.pageService.addAttachment(
                attributes['file-file-name'],
                attributes.file
              );
              const isImage = /\.(gif|jpe?g|tiff?|png|webp|svg|bmp)$/i.test(
                attributes['file-file-name']
              );

              this.getResource(
                isImage
                  ? getResourceTypeEnum.image
                  : getResourceTypeEnum.animation,
                attributes['file-file-name']
              );
            }
          });

          if (manifest?.pages?.length) {
            this._pageBookSubPagesManifest = manifest.pages;
            this._visibleHiddenPageIds.clear();
            this._pageBookSubPages = manifest.pages.filter(
              (page) => !page.isHidden
            );

            this.totalPages = this._pageBookSubPages.length;
            this._pageBookManifestLoaded = true;
            manifest.pages.forEach((page) => {
              this.loadBookPage(page as TractPage);
            });
          } else {
            this.pageService.setDir('ltr');
            this.bookNotAvailableInLanguage = true;
          }
        });
      } catch (e) {
        console.error('Manifest Parse error', e);
      }
    }
  }

  private getAvailableLanguagesForSelectedBook(): void {
    this.availableLanguages = [];
    if (this._allLanguages && this._allLanguages.length > 0) {
      this._allLanguages.forEach((lang) => {
        const translations = lang.relationships?.translations?.data || null;

        if (translations) {
          let isLanguageForSelectedBook = false;
          translations.forEach((translation) => {
            this._pageBookTranslations.forEach((pageBookTranslation) => {
              if (translation.id === pageBookTranslation.id) {
                isLanguageForSelectedBook = true;
                return;
              }
            });
            if (isLanguageForSelectedBook) {
              return;
            }
          });

          if (isLanguageForSelectedBook) {
            this.availableLanguages.push(lang);
          }
        }
      });
    }

    if (this.checkIfPreSelectedLanguageExists()) {
      this.loadBookManifestXML();
    } else {
      this.pageService.setDir('ltr');
      this.bookNotAvailableInLanguage = true;
      this.loaderService.display(false);
    }
  }

  private loadPageBookIndex(): void {
    this._pageBookTranslations = [];
    this.commonService
      .downloadFile(APIURL.GET_INDEX_FILE.replace('{0}', this._pageBook.id))
      .pipe(takeUntil(this._unsubscribeAll), takeUntil(this._pageChanged))
      .subscribe((data: any) => {
        const enc = new TextDecoder('utf-8');
        const arr = new Uint8Array(data);
        const result = enc.decode(arr);
        const jsonResource = JSON.parse(result);
        this._pageBookIndex = jsonResource;
        const resourceTypes = [
          ResourceType.Tract,
          ResourceType.CYOA,
          ResourceType.Lesson
        ];

        if (
          !resourceTypes.includes(
            jsonResource?.data?.attributes?.['resource-type']
          )
        ) {
          this.pageService.setDir('ltr');
          this.bookNotAvailable = true;
          this.loaderService.display(false);
          return;
        }

        this.resourceType = jsonResource?.data?.attributes?.['resource-type'];

        if (!jsonResource.data.attributes['manifest']) {
          this.pageService.setDir('ltr');
          this.bookNotAvailable = true;
          this.loaderService.display(false);
          return;
        }
        const latestTranslations =
          jsonResource.data.relationships?.['latest-translations']?.data;

        if (latestTranslations?.length) {
          if (jsonResource.included?.length) {
            const includedTranslations = jsonResource.included;
            latestTranslations.forEach((pageBookTranslationItem) => {
              const translations = includedTranslations.filter((row) => {
                if (
                  row.type === 'translation' &&
                  row.id === pageBookTranslationItem.id
                ) {
                  return true;
                }

                return false;
              });
              translations?.forEach((item) => {
                this._pageBookTranslations.push(item);
              });
            });
          }
        }

        this.selectedBookName = jsonResource.data.attributes['name'];

        this.getAvailableLanguagesForSelectedBook();
      });
  }

  private loadPageBook(): void {
    this._pageBook =
      this._books.find((book) =>
        book.attributes.abbreviation === this._pageParams.bookId ? book : false
      ) || {};

    if (!this._pageBook.id) {
      this.pageService.setDir('ltr');
      this.bookNotAvailable = true;
      this.loaderService.display(false);
    } else {
      this._pageBookLoaded = true;
      this.loadPageBookIndex();
    }
  }

  private getAllBooks(): void {
    this.commonService
      .getBooks(APIURL.GET_ALL_BOOKS)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        if (data && data.data) {
          this._books = data.data;
          this._booksLoaded = true;
          this.loadPageBook();
        } else {
          this.pageService.setDir('ltr');
          this.bookNotAvailable = true;
          this.loaderService.display(false);
        }
      });
  }

  private getAllLanguages(): void {
    this._allLanguages = [];
    this.commonService
      .getLanguages(APIURL.GET_ALL_LANGUAGES)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        if (data && data.data) {
          this._allLanguages = data.data;
          this._allLanguagesLoaded = true;
          if (this._pageParams && this._pageParams.langId) {
            this.setSelectedLanguage();
          }
          this.getAllBooks();
        } else {
          this.pageService.setDir('ltr');
          this.bookNotAvailable = true;
          this.loaderService.display(false);
        }
      });
  }

  private setSelectedLanguage(): void {
    this._allLanguages.forEach((lang) => {
      const attributes = lang.attributes;
      if (attributes?.code && attributes?.code === this._pageParams.langId) {
        this._selectedLanguage = lang;
        this.selectedLang = attributes.name;
        this.pageService.setDir(attributes.direction);
      }
    });
  }

  private checkIfPreSelectedLanguageExists(): boolean {
    if (this._selectedLanguage && this._selectedLanguage.id) {
      const y = this._pageBookTranslations.find((x) => {
        return (
          x?.relationships?.language?.data?.id &&
          x?.relationships?.language?.data?.id === this._selectedLanguage.id
        );
      });
      return y && y.id;
    } else {
      return false;
    }
  }

  private awaitPageChanged(): void {
    this._pageChanged
      .pipe(takeUntil(this._unsubscribeAll), delay(0))
      .subscribe(() => {
        if (!this._allLanguagesLoaded) {
          this.loaderService.display(true);
          this.getAllLanguages();
        } else if (!this._booksLoaded) {
          this.loaderService.display(true);
          this.getAllBooks();
        } else if (!this._pageBookLoaded) {
          this.loaderService.display(true);
          this.loadPageBook();
        } else {
          if (this._pageBookManifestLoaded) {
            if (this._pageBookSubPages && this._pageBookSubPages.length) {
              const pageId = this._pageParams.pageId;
              const matchedPage = this._pageBookSubPages.find((page) => {
                if (this.isCYOAPage()) {
                  return page.id === pageId;
                } else {
                  return page.position === Number(pageId);
                }
              });

              if (matchedPage) {
                this.showPage(matchedPage as TractPage);
                return;
              }
            }
            // If we can't find the page in the sub pages
            // We try to find the page in the manifest
            const fallbackId = this.cleanPageId();
            if (
              typeof fallbackId === 'number' &&
              this._pageBookSubPagesManifest?.length > fallbackId
            ) {
              const fallbackPage = this._pageBookManifest.pages[
                fallbackId
              ] as TractPage;
              if (fallbackPage) {
                this.pagesLoaded = false;
                this.loaderService.display(true);
                this.loadBookPage(fallbackPage);
                return;
              }
            }
          }

          this.loaderService.display(true);
          this.clearData();
          this.getAllBooks();
        }
      });
  }

  private awaitPageParameters(): void {
    this.route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((params) => {
        const { langId, bookId } = this._pageParams;
        const bookChanged =
          langId !== params['langId'] || bookId !== params['bookId'];

        if (!bookChanged) {
          this._pageParams.pageId = params['page'];
        } else {
          this._pageParams.langId = params['langId'];
          this._pageParams.resourceType = params['resourceType'];
          this._pageParams.toolType = params['toolType'];
          this._pageParams.bookId = params['bookId'];
          this._pageParams.pageId = params['page'];
          this.clearData();
          if (this._allLanguagesLoaded) {
            this.setSelectedLanguage();
          }
        }
        this._pageChanged.next();
      });
  }

  private awaitPageNavigation(): void {
    // Navigate to the next page upon request
    this.pageService.nextPage$
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._pageChanged),
        delay(0)
      )
      .subscribe(() => {
        this.onNextPage();
      });

    // Navigate to the previous page upon request
    this.pageService.previousPage$
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._pageChanged),
        delay(0)
      )
      .subscribe(() => {
        this.onPreviousPage();
      });

    // Navigate to specified page upon request
    this.pageService.navigateToPage$
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._pageChanged),
        delay(0)
      )
      .subscribe((pagePosition) => {
        this.onNavigateToPage(pagePosition);
      });

    // Go to any page on page event
    this.awaitPageEvent();
  }

  private awaitPageEvent(): void {
    // We listen for page events and dismiss events
    // We then navigate to the page that has the event
    // Use _pageBookSubPagesManifest (ALL pages including hidden) to get all listeners
    const allListenersOnAllPages = this._pageBookSubPagesManifest.reduce(
      (allListeners, page) => {
        // Add null checks for listeners and dismissListeners
        const pageListeners = page.listeners
          ? page.listeners.map((listener) => listener.name)
          : [];
        const pageDismissListeners = page.dismissListeners
          ? page.dismissListeners.map((listener) => listener.name)
          : [];

        return allListeners.concat(pageListeners, pageDismissListeners);
      },
      []
    );

    const manifestDismissListeners =
      this._pageBookManifest?.dismissListeners?.map(
        (listener) => listener.name
      ) || [];

    const allKnownListeners = allListenersOnAllPages.concat(
      manifestDismissListeners
    );

    this.pageService.contentEvent$
      .pipe(
        filter((event) =>
          allKnownListeners.some((allListenersOnPage) =>
            allListenersOnPage.includes(event)
          )
        )
      )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((event) => {
        this.navigateToPageOnEvent(event);
      });
  }

  private getPageIdForRouting(page: Page): string | number {
    if (!page) {
      return 0;
    }
    return this.isCYOAPage() ? page.id : page.position;
  }

  private cleanPageId(): number | string {
    const id = Number(this._pageParams.pageId);
    return Number.isInteger(id) ? id : this._pageParams.pageId;
  }

  private isCYOAPage(): boolean {
    const cyoaPageTypes = [
      godToolsParser.model.page.ContentPage,
      godToolsParser.model.page.CardCollectionPage,
      godToolsParser.model.page.PageCollectionPage
    ];

    return cyoaPageTypes.some(
      (pageType) => this.activePage instanceof pageType
    );
  }

  private navigateToPageOnEvent(event: string): void {
    let isListener = false;
    let isDismissListener = false;
    let pageToNavigateTo = null;

    this._pageBookSubPagesManifest.forEach((page) => {
      const foundListener = page.listeners.some(
        (listener) => listener.name === event
      );
      const foundDismissListener = page.dismissListeners.some(
        (listener) => listener.name === event
      );

      if (foundListener || foundDismissListener) {
        pageToNavigateTo = page;
        isListener = foundListener;
        isDismissListener = foundDismissListener;
      }
    });

    const manifestDismissListeners =
      this._pageBookManifest?.dismissListeners || [];
    const isManifestDismissListener = manifestDismissListeners.some(
      (listener) => listener.name === event
    );

    if (isManifestDismissListener) {
      this.router.navigate([this._pageParams.langId]);
      return;
    }

    if (!pageToNavigateTo) {
      return;
    }

    const pageIdForRouting = this.getPageIdForRouting(pageToNavigateTo);

    if (isListener) {
      if (pageToNavigateTo.isHidden) {
        // Mark page as temporarily visible so that we can navigate to it.
        this._visibleHiddenPageIds.add(pageToNavigateTo.id);
        // Rebuild visible pages list
        this.updateVisiblePages();
      }

      this.pageService.addToNavigationStack(String(pageIdForRouting));
      this.router.navigate(
        this.buildRouteParams(
          this._pageParams.langId,
          this._pageParams.toolType,
          this._pageParams.bookId,
          pageIdForRouting
        )
      );
    }

    if (isDismissListener) {
      this.pageService.removeFromNavigationStack(String(pageIdForRouting));
      this.pageService.getNavigationStack().subscribe((stack) => {
        const previousPage = stack[stack.length - 1];
        this.router.navigate(
          this.buildRouteParams(
            this._pageParams.langId,
            this._pageParams.toolType,
            this._pageParams.bookId,
            previousPage
          )
        );
      });
      // We want to hide the page, for now I've set this to go to the next page.
      this.onNextPage();
    }
  }

  private updateVisiblePages(): void {
    this._pageBookSubPages = this._pageBookSubPagesManifest.filter(
      (page) => !page.isHidden || this._visibleHiddenPageIds.has(page.id)
    );
    this.totalPages = this._pageBookSubPages.length;
  }

  private cleanupHiddenPages(currentPageId: string): void {
    const currentPage = this._pageBookSubPagesManifest.find(
      (page) => page.id === currentPageId
    );

    const hiddenPagesToRemove: string[] = [];
    this._visibleHiddenPageIds.forEach((pageId) => {
      if (pageId !== currentPageId || !currentPage.isHidden) {
        hiddenPagesToRemove.push(pageId);
      }
    });

    hiddenPagesToRemove.forEach((pageId) => {
      this._visibleHiddenPageIds.delete(pageId);
    });

    if (hiddenPagesToRemove.length) {
      this.updateVisiblePages();
    }
  }

  private awaitEmailFormSignupDataSubmitted(): void {
    this.pageService.emailSignupFormData$
      .pipe(
        takeUntil(this._unsubscribeAll),
        filter((tData) => tData)
      )
      .subscribe((data) => {
        if (data.name && data.email && data.destination_id) {
          const subscriberData = {
            data: {
              type: 'follow_up',
              attributes: {
                name: data.name,
                email: data.email,
                language_id: Number(this._selectedLanguage.id),
                destination_id: Number(data.destination_id)
              }
            }
          };
          this.commonService
            .createSubscriber(subscriberData)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe();
        }
      });
  }

  private clearData(): void {
    this._booksLoaded = false;
    this._books = [];
    this._pageBookLoaded = false;
    this._pageBook = {};
    this._pageBookIndex = {};
    this._pageBookManifestLoaded = false;
    this._pageBookManifest = {} as Manifest;
    this._pageBookTranslations = [];
    this._pageBookTranslationId = 0;
    this._pageBookSubPagesManifest = [];
    this._pageBookSubPages = [];
    this._visibleHiddenPageIds.clear();
    this.availableLanguages = [];
    this.selectedBookName = '';
    this.languagesVisible = false;
    this.activePage = null;
    this.activePageOrder = 0;
    this.totalPages = 0;
    this.bookNotAvailableInLanguage = false;
    this.bookNotAvailable = false;
  }

  private showPage(page: TractPage): void {
    this.activePageOrder = page.position;
    this.activePage = page;

    this.cleanupHiddenPages(page.id);

    const hasNextPage = this.hasNextVisiblePage(page.position);
    const hasPreviousPage = this.hasPreviousVisiblePage(page.position);

    this.pageService.setPageNavigationState(hasPreviousPage, hasNextPage);

    this.awaitPageNavigation();
    this.viewportScroller.scrollToPosition([0, 0]);
    setTimeout(() => {
      this.pagesLoaded = true;
      this.loaderService.display(false);
    }, 0);
  }

  private hasNextVisiblePage(currentPosition: number): boolean {
    return this.getVisiblePages(currentPosition, 'next').length > 0;
  }

  private hasPreviousVisiblePage(currentPosition: number): boolean {
    return this.getVisiblePages(currentPosition, 'previous').length > 0;
  }

  private awaitLiveShareStream(): void {
    const liveShareStreamId = this.route.snapshot.queryParams.liveShareStream;
    if (liveShareStreamId) {
      this.liveShareSubscription = ActionCable.createConsumer(
        environment.mobileContentApiWsUrl
      ).subscriptions.create(
        {
          channel: 'SubscribeChannel',
          channelId: liveShareStreamId
        },
        {
          received: async ({ data }: LiveShareSubscriptionPayload) => {
            if (!data || data.type !== 'navigation-event') {
              return;
            }

            const Url = this.router
              .createUrlTree(
                this.buildRouteParams(
                  data.attributes.locale,
                  this._pageParams.toolType,
                  data.attributes.tool,
                  data.attributes.page
                ),
                {
                  queryParams: this.route.snapshot.queryParams,

                  ...(data.attributes.card !== undefined
                    ? { fragment: `card-${data.attributes.card}` }
                    : {})
                }
              )
              .toString();
            if (data.attributes.card) {
              setTimeout(() => {
                this.viewportScroller.scrollToAnchor(
                  `card-${data.attributes.card}`
                );
              }, 100);
            }
            this.router.navigateByUrl(Url.toString());
          }
        }
      );
    }
  }
}
