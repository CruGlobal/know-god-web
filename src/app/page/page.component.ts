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
import { CommonService } from '../services/common.service';
import { LoaderService } from '../services/loader-service/loader.service';
import { IPageParameters } from './model/page-parameters';
import { APIURL, MOBILE_CONTENT_API_WS_URL } from '../api/url';
import { KgwManifest } from './model/xmlns/manifest/manifest-manifest';
import { KgwTract } from './model/xmlns/tract/tract-tract';
import { KgwManifestComplexTypePage } from './model/xmlns/manifest/manifest-ct-page';
import { KgwTractComplexTypePage } from './model/xmlns/tract/tract-ct-page';
import { PageService } from './service/page-service.service';
import { KgwManifestComplexTypeTip } from './model/xmlns/manifest/manifest-ct-tip';
import { KgwTraining } from './model/xmlns/training/training-training';
import { ViewportScroller } from '@angular/common';
import * as ActionCable from '@rails/actioncable';
import { PullParserFactory, ParserConfig } from '../services/xml-parser-service/xmp-parser.service';
import * as Parser from '@cruglobal/godtools-shared'
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
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PageComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<any>();
  private _pageChanged = new Subject<any>();
  private _pageParams: IPageParameters;
  private _allLanguagesLoaded: boolean;
  private _allLanguages: Array<any>;
  private _booksLoaded: boolean;
  private _books: Array<any>;
  private _pageBookLoaded: boolean;
  private _pageBook: any;
  private _pageBookIndex: any;
  private _pageBookMainfest: KgwManifest;
  private _pageBookMainfestLoaded: boolean;
  private _pageBookTranslations: Array<any>;
  private _pageBookTranslationId: number;
  private _pageBookSubPagesManifest: Array<KgwManifestComplexTypePage>;
  private _pageBookTipsManifest: Array<KgwManifestComplexTypeTip>;
  private _pageBookSubPages: Array<KgwTract>;
  private _pageBookTips: Array<KgwTraining>;
  private _selectedLanguage: any;
  private liveShareSubscription: ActionCable.Channel;

  pagesLoaded: boolean;
  selectedLang: string;
  availableLanguages: Array<any>;
  languagesVisible: boolean;
  selectedBookName: string;
  activePage: KgwTractComplexTypePage;
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
    console.log('Parser', Parser);
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
    const tPageOrder = !!this._pageParams.pageid ? this._pageParams.pageid : 0;
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

  private async loadBookPage(
    page: KgwManifestComplexTypePage,
    pageorder: number
  ): Promise<void> {

    const fileName = APIURL.GET_XML_FILES_FOR_MANIFEST +
    this._pageBookTranslationId +
    '/' +
    page.src

    // this.parserState.addFile = fileName

    // const file = await this.pullParserFactory.readFile(fileName)
    // console.log('file', file)
    // console.log('ParserConfig', Parser.org.cru.godtools.shared.tool.parser.ParserConfig.createParserConfig())

    // const newParser = new Parser.ManifestParser(this.pullParserFactory, Parser.org.cru.godtools.shared.tool.parser.ParserConfig.createParserConfig());
    // console.log('defaultConfig', newParser.defaultConfig)
    // const controller = new AbortController();
    // const signal = controller.signal;
    // console.log('fileName', fileName);

    // try {
    //   newParser.parseManifest(fileName, signal).then((data) => {
    //     console.log('parseManifest', data)
    //   })
    // } catch(e) {
    //   console.log('parseManifest.ERROR', e)
    // }



    this.commonService
      .downloadFile(fileName)
      .subscribe((data: any) => {
        const enc = new TextDecoder('utf-8');
        const arr = new Uint8Array(data);
        const result = enc.decode(arr);

        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'application/xml');

        const _tTract: KgwTract = new KgwTract(result);
        _tTract.pagename = page.filename;
        _tTract.pageorder = pageorder;
        _tTract.parseXml();
        if (_tTract && _tTract.page) {
          const _tTractResources = _tTract.getResources();
          const _tTractImages = _tTractResources['images'];
          const _tTractAnimations = _tTractResources['animations'];
          if (_tTractImages && _tTractImages.length) {
            _tTractImages.forEach((image) => {
              this.getImage(image);
            });
          }

          if (_tTractAnimations && _tTractAnimations.length) {
            _tTractAnimations.forEach((animation) => {
              this.getAnimation(animation);
            });
          }

          this._pageBookSubPages.push(_tTract);

          if (
            (this._pageParams.pageid &&
              pageorder === this._pageParams.pageid) ||
            (!this._pageParams.pageid && pageorder === 0)
          ) {
            this.showPage(_tTract);
          }
        }
      });
  }

  private loadTip(tip: KgwManifestComplexTypeTip): void {
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
        const _tTraining: KgwTraining = new KgwTraining(result);
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
      const fileName = APIURL.GET_XML_FILES_FOR_MANIFEST + translationid + '/' + manifestName
      const config = Parser.org.cru.godtools.shared.tool.parser.ParserConfig.createParserConfig()
      console.log('2.ParserConfig', config)
      // console.log('2.state', Parser.org.cru.godtools.shared.tool.state.State.createState)

      const newParser = new Parser.ManifestParser(this.pullParserFactory, config);
      // console.log('2.defaultConfig', newParser.defaultConfig)
      const controller = new AbortController();
      const signal = controller.signal;
      console.log('2.fileName', fileName);

      try {
        newParser.parseManifest(fileName, signal).then((data) => {
          console.log('2.parseManifest', data)
          // console.log('2.parseManifest', data.manifest)
          // console.log('2.parseManifest', data._pages)

        })
      } catch(e) {
        console.log('2.parseManifest.ERROR', e)
      }



      this.commonService
        .downloadFile(fileName)
        .pipe(takeUntil(this._unsubscribeAll), takeUntil(this._pageChanged))
        .subscribe((data) => {
          const enc = new TextDecoder('utf-8');
          const arr = new Uint8Array(data);
          const result = enc.decode(arr);
          this._pageBookMainfest = new KgwManifest(result);
          this._pageBookMainfest.parseXml();
          this._pageBookTranslationId = translationid;

          if (
            this._pageBookMainfest.manifest &&
            this._pageBookMainfest.manifest.pages &&
            this._pageBookMainfest.manifest.pages.length > 0
          ) {
            this._pageBookSubPagesManifest = [];
            this._pageBookSubPages = [];
            let tPageOrder = 0;
            this._pageBookMainfest.manifest.pages.forEach((tPage) => {
              this._pageBookSubPagesManifest.push(tPage);
              this.loadBookPage(tPage, tPageOrder);
              tPageOrder++;
            });
            this.totalPages = this._pageBookSubPagesManifest.length;
            this._pageBookMainfestLoaded = true;
          } else {
            this.pageService.setDir('ltr');
            this.bookNotAvailableInLanguage = true;
          }

          if (
            this._pageBookMainfest.manifest &&
            this._pageBookMainfest.manifest.tips &&
            this._pageBookMainfest.manifest.tips.length > 0
          ) {
            this._pageBookTipsManifest = [];
            this._pageBookTips = [];
            this._pageBookMainfest.manifest.tips.forEach((tTip) => {
              this._pageBookTipsManifest.push(tTip);
              // You can enable tips to be loaded by uncommenting the following line
              // this.loadTip(tTip);
            });
          }
        });
    }
  }

  private getAvailableLanguagesForSelectedBook(): void {
    this.availableLanguages = [];
    if (this._allLanguages && this._allLanguages.length > 0) {
      this._allLanguages.forEach((languageItem) => {
        if (
          languageItem.relationships &&
          languageItem.relationships.translations &&
          languageItem.relationships.translations.data
        ) {
          const languageTranslations =
            languageItem.relationships.translations.data;

          let isLanguageForSelectedBook = false;

          languageTranslations.forEach((languageTranslation) => {
            this._pageBookTranslations.forEach((pageBookTranslation) => {
              if (languageTranslation.id === pageBookTranslation.id) {
                isLanguageForSelectedBook = true;
                return;
              }
            });
            if (isLanguageForSelectedBook) {
              return;
            }
          });

          if (isLanguageForSelectedBook) {
            this.availableLanguages.push(languageItem);
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
    this._pageBook = {};

    this._books.forEach((x) => {
      if (x.attributes.abbreviation === this._pageParams.bookid) {
        this._pageBook = x;
      }
    });

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
      if (
        lang &&
        lang.attributes &&
        lang.attributes['code'] &&
        lang.attributes['code'] === this._pageParams.langid
      ) {
        this._selectedLanguage = lang;
        this.selectedLang = lang.attributes.name;
        this.pageService.setDir(lang.attributes.direction);
      }
    });
  }

  private checkIfPreSelectedLanguageExists(): boolean {
    if (this._selectedLanguage && this._selectedLanguage.id) {
      const y = this._pageBookTranslations.find((x) => {
        return (
          x.relationships &&
          x.relationships.language &&
          x.relationships.language.data &&
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
                (sPage) => sPage.pageorder === this._pageParams.pageid
              );
              if (index >= 0) {
                const tTract = this._pageBookSubPages[index];
                this.showPage(tTract);
                return;
              }
            }

            if (
              this._pageBookSubPagesManifest &&
              this._pageBookSubPagesManifest.length > this._pageParams.pageid
            ) {
              const tSubPageManifest =
                this._pageBookMainfest[this._pageParams.pageid];
              if (tSubPageManifest) {
                this.pagesLoaded = false;
                this.loaderService.display(true);
                this.loadBookPage(tSubPageManifest, this.activePageOrder);
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
        let bookChanged = false;
        if (this._pageParams.langid !== params['langid']) {
          bookChanged = true;
        } else if (this._pageParams.bookid !== params['bookid']) {
          bookChanged = true;
        }

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
    this._pageBookMainfest = new KgwManifest('');
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

  private showPage(page: KgwTract): void {
    this.activePageOrder = page.pageorder;
    this.activePage = page.page;
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
