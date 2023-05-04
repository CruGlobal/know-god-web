import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, filter, takeUntil } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';
import * as ActionCable from '@rails/actioncable';
import { CommonService } from '../services/common.service';
import { LoaderService } from '../services/loader-service/loader.service';
import { IPageParameters } from './model/page-parameters';
import { APIURL, MOBILE_CONTENT_API_WS_URL } from '../api/url';
import { PageService } from './service/page-service.service';
import {
  PullParserFactory,
  Page,
  Manifest,
  TractPage,
  XmlParser,
  XmlParserData
} from '../services/xml-parser-service/xmp-parser.service';

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

@Component({
  selector: 'app-page-new',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PageNewComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<any>();
  private _pageChanged = new Subject<any>();
  private _pageParams: IPageParameters;
  private _allLanguagesLoaded: boolean;
  private _allLanguages: any[];
  private _booksLoaded: boolean;
  private _books: any[];
  private _pageBookLoaded: boolean;
  private _pageBook: any;
  private _pageBookIndex: any;
  private _pageBookMainfest: Manifest;
  private _pageBookMainfestLoaded: boolean;
  private _pageBookTranslations: any[];
  private _pageBookTranslationId: number;
  private _pageBookSubPagesManifest: Page[];
  private _pageBookTipsManifest: any[]; // NEED TIP CLASS
  private _pageBookSubPages: Page[];
  private _pageBookTips: any[]; // NEED TIP CLASS
  private _selectedLanguage: any;
  private liveShareSubscription: ActionCable.Channel;

  pagesLoaded: boolean;
  selectedLang: string;
  availableLanguages: Array<any>;
  languagesVisible: boolean;
  selectedBookName: string;
  activePage: any;
  activePageOrder: number;
  totalPages: number;
  bookNotAvailableInLanguage: boolean;
  bookNotAvailable: boolean;

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
      langid: '',
      bookid: ''
    };
    this._books = [];
    this.activePageOrder = 0;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
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
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this._pageChanged.complete();
    if (this.liveShareSubscription) {
      this.liveShareSubscription.unsubscribe();
    }
  }

  selectLanguage(lang): void {
    const tPageOrder = this._pageParams.pageid || 0;
    this.router.navigate([
      lang.attributes.code,
      this._pageParams.bookid,
      tPageOrder
    ]);
    return;
  }

  onToggleLanaguageSelect(): void {
    this.languagesVisible = !this.languagesVisible;
  }

  private onPreviousPage(): void {
    if (this._pageParams.pageid > 0) {
      this.router.navigate([
        this._pageParams.langid,
        this._pageParams.bookid,
        this._pageParams.pageid - 1
      ]);
    }
  }

  private onNextPage(): void {
    if (this._pageParams.pageid + 1 < this._pageBookSubPagesManifest.length) {
      this.router.navigate([
        this._pageParams.langid,
        this._pageParams.bookid,
        this._pageParams.pageid + 1
      ]);
    }
  }

  private getAnimation(resource): void {
    // NEED Animation Object
    if (resource === undefined || resource === '' || resource === null) {
      return;
    }

    if (this._pageBookIndex !== undefined && this._pageBookIndex !== null) {
      const attachments = this._pageBookIndex.included.filter((row) => {
        if (
          row.type.toLowerCase() === 'attachment' &&
          row.attributes['file-file-name'].toLowerCase() ===
            resource.toLowerCase()
        ) {
          return true;
        } else {
          return false;
        }
      });

      if (attachments.length === 0) {
        return;
      }

      const filename = attachments[0].attributes.file;
      this.pageService.addToAnimationsDict(resource, filename);
      return filename;
    }
  }

  private getImage(resource): string {
    if (resource === undefined || resource === '' || resource === null) {
      return '';
    }

    if (this._pageBookIndex !== undefined && this._pageBookIndex !== null) {
      const attachments = this._pageBookIndex.included.filter((row) => {
        if (
          row.type.toLowerCase() === 'attachment' &&
          row.attributes['file-file-name'].toLowerCase() ===
            resource.toLowerCase()
        ) {
          return true;
        } else {
          return false;
        }
      });

      if (attachments.length === 0) {
        return '';
      }

      const filename = attachments[0].attributes.file;

      const link = document.createElement('link');
      link.href = filename;
      link.rel = 'prefetch';
      document.getElementsByTagName('head')[0].appendChild(link);

      this.pageService.addToImagesDict(resource, filename);
      return filename;
    }
  }

  private async loadBookPage(page: TractPage): Promise<void> {
    const pageId = this._pageParams.pageid;
    const showpage: boolean = pageId
      ? page.position === pageId
      : page.position === 0;
    if (showpage) this.showPage(page);
  }

  private loadTip(tip: any): void {
    // PIZZA
    this.commonService
      .downloadFile(
        APIURL.GET_XML_FILES_FOR_MANIFEST +
          this._pageBookTranslationId +
          '/' +
          tip.src
      )
      .pipe(takeUntil(this._unsubscribeAll), takeUntil(this._pageChanged))
      .subscribe((data) => {
        const enc = new TextDecoder('utf-8');
        const arr = new Uint8Array(data);
        const result = enc.decode(arr);

        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'application/xml');
        // const _tTraining: any = new KgwTraining(result);
        const _tTraining: any = result;
        _tTraining.id = tip.id;
        _tTraining.parseXml();
        if (_tTraining && _tTraining.pages && _tTraining.pages.length) {
          const _tTrainingImages = _tTraining.getImageResources();
          if (_tTrainingImages && _tTrainingImages.length) {
            _tTrainingImages.forEach((image) => {
              this.getImage(image);
            });
          }
        }
        this._pageBookTips.push(_tTraining);
      });
  }

  private loadBookManifestXML(): void {
    this.pageService.clear();
    let item: any = {};
    this.pullParserFactory.clearOrigin();
    this._pageBookTranslations.forEach((translation) => {
      if (
        translation &&
        translation.relationships &&
        translation.relationships.language &&
        translation.relationships.language.data &&
        translation.relationships.language.data.id &&
        translation.relationships.language.data.id === this._selectedLanguage.id
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
      const fileName =
        APIURL.GET_XML_FILES_FOR_MANIFEST + translationid + '/' + manifestName;
      // https://cru-mobilecontentapi-staging.s3.us-east-1.amazonaws.com/translations/files/7e92da93d9b1eec01d9f7dfd015a484b97fdd486deb2c18ef20e8116cbd02f7a.xml
      // const fileName = `http://localhost:4200/assets/img/${manifestName}`
      this.pullParserFactory.setOrigin(fileName);
      const config = XmlParser.ParserConfig.createParserConfig()
        .withLegacyWebImageResources(true)
        .withSupportedFeatures([
          XmlParser.ParserConfig.Companion.FEATURE_ANIMATION,
          XmlParser.ParserConfig.Companion.FEATURE_CONTENT_CARD,
          XmlParser.ParserConfig.Companion.FEATURE_MULTISELECT
        ])
        .withParseTips(false);
      const newParser = new XmlParser.ManifestParser(
        this.pullParserFactory,
        config
      );
      const controller = new AbortController();
      const signal = controller.signal;
      try {
        newParser.parseManifest(fileName, signal).then((data) => {
          const { manifest } = data as XmlParserData;
          this._pageBookMainfest = manifest;

          // Loop through and get all resources.
          this._pageBookIndex.included.forEach((resource) => {
            const { attributes, type } = resource;
            if (type === 'attachment') {
              this.pageService.addImage(
                attributes['file-file-name'],
                attributes.file
              );
              if (!attributes['is-zipped'] === true) {
                this.getImage(attributes['file-file-name']);
              }
            }
          });

          if (manifest?.pages?.length) {
            this._pageBookSubPagesManifest = manifest.pages;
            this._pageBookSubPages = manifest.pages;
            this.totalPages = manifest.pages.length;
            this._pageBookMainfestLoaded = true;
            manifest.pages.forEach((page) => {
              this.loadBookPage(page as TractPage);
            });
          } else {
            this.pageService.setDir('ltr');
            this.bookNotAvailableInLanguage = true;
          }

          if (manifest.hasTips) {
            // PIZZA
            // this._pageBookTipsManifest = [];
            // this._pageBookTips = [];
            // this._pageBookMainfest.manifest.tips.forEach((tTip) => {
            //   this._pageBookTipsManifest.push(tTip);
            // });
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

        if (
          jsonResource &&
          jsonResource.data &&
          jsonResource.data.attributes &&
          jsonResource.data.attributes['resource-type'] &&
          jsonResource.data.attributes['resource-type'] === 'tract'
        ) {
          if (!jsonResource.data.attributes['manifest']) {
            this.pageService.setDir('ltr');
            this.bookNotAvailable = true;
            this.loaderService.display(false);
            return;
          }

          if (
            jsonResource.data.relationships &&
            jsonResource.data.relationships['latest-translations'] &&
            jsonResource.data.relationships['latest-translations'].data
          ) {
            const tPageBookRequiredTranslations =
              jsonResource.data.relationships['latest-translations'].data;
            if (
              tPageBookRequiredTranslations &&
              tPageBookRequiredTranslations.length > 0 &&
              jsonResource.included &&
              jsonResource.included.length > 0
            ) {
              const tIncluded = jsonResource.included;
              tPageBookRequiredTranslations.forEach(
                (pageBookTranslationItem) => {
                  const translations = tIncluded.filter((row) => {
                    if (
                      row.type === 'translation' &&
                      row.id === pageBookTranslationItem.id
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  });
                  if (translations && translations.length > 0) {
                    translations.forEach((item) => {
                      this._pageBookTranslations.push(item);
                    });
                  }
                }
              );
            }
          }

          this.selectedBookName = jsonResource.data.attributes['name'];

          this.getAvailableLanguagesForSelectedBook();
        } else {
          this.pageService.setDir('ltr');
          this.bookNotAvailable = true;
          this.loaderService.display(false);
        }
      });
  }

  private loadPageBook(): void {
    this._pageBook =
      this._books.find((book) =>
        book.attributes.abbreviation === this._pageParams.bookid ? book : false
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
          if (this._pageParams && this._pageParams.langid) {
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
      if (attributes.code && attributes.code === this._pageParams.langid) {
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
          x.relationships.language.data.id &&
          x.relationships.language.data.id === this._selectedLanguage.id
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
          if (this._pageBookMainfestLoaded) {
            if (this._pageBookSubPages && this._pageBookSubPages.length) {
              const index = this._pageBookSubPages.findIndex(
                (sPage) => sPage.position === this._pageParams.pageid
              );
              if (index >= 0) {
                const tTract = this._pageBookSubPages[index] as TractPage;
                this.showPage(tTract);
                return;
              }
            }

            if (
              this._pageBookSubPagesManifest &&
              this._pageBookSubPagesManifest.length > this._pageParams.pageid
            ) {
              const tSubPageManifest = this._pageBookMainfest.pages[
                this._pageParams.pageid
              ] as TractPage;
              if (tSubPageManifest) {
                this.pagesLoaded = false;
                this.loaderService.display(true);
                this.loadBookPage(tSubPageManifest);
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
        const { langid, bookid } = this._pageParams;
        const bookChanged =
          langid !== params['langid'] && bookid !== params['bookid'];

        if (!bookChanged) {
          this._pageParams.pageid = Number(params['page']);
        } else {
          this._pageParams.langid = params['langid'];
          this._pageParams.bookid = params['bookid'];
          this._pageParams.pageid = Number(params['page']);
          this.clearData();
          if (this._allLanguagesLoaded) {
            this.setSelectedLanguage();
          }
        }
        this._pageChanged.next();
      });
  }

  private awaitPageNavigation(): void {
    this.pageService.nextPage$
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._pageChanged),
        delay(0)
      )
      .subscribe(() => {
        this.onNextPage();
      });

    this.pageService.previousPage$
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._pageChanged),
        delay(0)
      )
      .subscribe(() => {
        this.onPreviousPage();
      });
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
    this._pageBookMainfestLoaded = false;
    this._pageBookMainfest = {} as Manifest;
    this._pageBookTranslations = [];
    this._pageBookTranslationId = 0;
    this._pageBookSubPagesManifest = [];
    this._pageBookSubPages = [];
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
    this.awaitPageNavigation();
    this.viewportScroller.scrollToPosition([0, 0]);
    setTimeout(() => {
      this.pagesLoaded = true;
      this.loaderService.display(false);
    }, 0);
  }

  private awaitLiveShareStream(): void {
    const liveShareStreamId = this.route.snapshot.queryParams.liveShareStream;
    if (liveShareStreamId) {
      this.liveShareSubscription = ActionCable.createConsumer(
        MOBILE_CONTENT_API_WS_URL
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
                [
                  data.attributes.locale,
                  data.attributes.tool,
                  data.attributes.page
                ],
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
