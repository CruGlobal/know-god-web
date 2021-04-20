import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { LoaderService } from '../services/loader-service/loader.service';
import { takeUntil, map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '../services/analytics.service';
import { CommonService } from '../services/common.service';
import { APIURL } from '../api/url';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { TextDecoder } from '../../../node_modules/text-encoding/index.js';
import { TractPage, ITractPageContent } from './models/tract-page';
import { IPageImageContent } from './models/page-image';

@Component({
  selector: 'app-page-new',
  templateUrl: './page-new.component.html',
  styleUrls: ['./page-new.component.css']
})
export class PageNewComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<any>();
  private _stopLoad = new Subject<any>();
  private _hasLanguages = new BehaviorSubject<boolean>(false);
  private _hasError = new BehaviorSubject<boolean>(false);
  private _showLanguages = new BehaviorSubject<boolean>(false);
  private _showNoRecordFound = new BehaviorSubject<boolean>(false);

  showLoader$: Observable<boolean>;
  hasLanguages$ = this._hasLanguages.asObservable();
  hasError$ = this._hasError.asObservable();
  showLanguages$ = this._showLanguages.asObservable();
  showNoRecordFound$ = this._showNoRecordFound.asObservable();
  pageGetparameters = {
    bookid: null,
    langid: null,
    pageid: null,
    dir: 'rtl'
  };
  counter = 0;
  errorMsg = '';
  lang = '';
  selectLan: any;
  selectedLanguageId: any;
  allLanguages: any;
  allBooks: any;
  allPages: ITractPageContent[] = [];
  selectbook: any;
  selectedBookId: any;
  BookID = '';
  allLanguagesTranslations: any;
  selectedBookLanguauageTranslations = [];
  pageNames = [];
  pageCount = 0;
  currentTranslations = [];
  currentBookTranslations = [];
  currentLanguageTransalations = [];
  IndexContent: any;
  currentPageContent: ITractPageContent;
  pages = [];
  page = {
    translationId: '',
    filename: '',
    src: ''
  };
  resources = [];
  resource = {
    translationId: '',
    filename: '',
    src: ''
  };
  pageContents = [];
  Cards = [];
  Modals = [];
  cardsContent = [];
  paras = [];
  call_to_action = '';
  summary_line: any;
  multiple_summary_line = [];
  paraGraph: any;
  image: any;
  tagline: string;
  isFirstPage = false;
  isLastPage = false;
  headerCounter;
  displayForm = false;
  displayModal = false;

  currentYear = new Date().getFullYear();

  constructor(
    private loaderService: LoaderService,
    private analyticsService: AnalyticsService,
    public commonService: CommonService,
    private ngxXml2jsonService: NgxXml2jsonService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.showLoader$ = this.loaderService.status.pipe(
      takeUntil(this._unsubscribeAll),
      map(tState => {
        return tState;
      })
    );
  }

  ngOnInit() {
    this.getAllLanguages();
    this.getAllBooks();
    //this.analyticsService.runAnalyticsOnHomepages();

    setTimeout(() => {
      this.watchPageParameters();
      if (this.commonService.selectedLan !== undefined) {
        this.selectLan = this.commonService.selectedLan.attributes.name;
        this.selectedLanguageId = this.commonService.selectedLan.id;
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this._stopLoad.next();
    this._stopLoad.complete();
    this._hasLanguages.complete();
    this._hasError.complete();
    this._showNoRecordFound.complete();
    this._showLanguages.complete();
  }

  selectLanguage(lang, selectChoice = false) {
    this.toggleLoader(true);
    this.toggleLanguages(true);
    this._stopLoad.next();
    this._hasError.next(false);
    this._showNoRecordFound.next(false);
    this.errorMsg = '';
    this.clearContent();

    if (lang == '') {
      if (this.pageGetparameters.bookid && this.pageGetparameters.langid) {
        this.allLanguages.forEach(x => {
          if (x.attributes.code == this.pageGetparameters.langid) {
            lang = x;
          }
        });
      }
    }

    this.lang = lang.attributes.code;
    this.pageGetparameters.langid = lang.attributes.code;
    this.pageGetparameters.dir = lang.attributes.direction;
    if (!this.pageGetparameters.pageid) {
      const Url = this.router
        .createUrlTree([
          '/page/new/rendered',
          lang.attributes.code,
          this.BookID
        ])
        .toString();
      this.router.navigateByUrl(Url.toString());
    }

    this.selectLan = lang.attributes.name;
    this.commonService.selectedLan = lang;
    this.selectedLanguageId = lang.id;

    this.commonService
      .getLanguages(APIURL.GET_ALL_LANGUAGES + lang.id)
      .pipe(
        takeUntil(this._unsubscribeAll),
        takeUntil(this._stopLoad)
      )
      .subscribe((data: any) => {
        this.currentLanguageTransalations =
          data.data.relationships.translations.data;
        this.translationsMapper(
          this.currentBookTranslations,
          this.currentLanguageTransalations
        );

        if (this.currentTranslations.length === 0) {
          this.errorMsg = 'This book is not available in selected language.';
          this._hasError.next(true);
          setTimeout(() => {
            this.toggleLoader(false);
          }, 0);
          return;
        } else {
          setTimeout(() => {
            this._hasError.next(false);
          }, 0);
        }

        if (this.pageGetparameters.pageid) {
          this.getXmlFiles(
            this.currentTranslations[this.pageGetparameters.pageid]
          );
          const Url = this.router
            .createUrlTree([
              '/page/new/rendered',
              this.lang,
              this.BookID,
              this.counter
            ])
            .toString();
          this.router.navigateByUrl(Url.toString());
          //this.analyticsService.runAnalyticsInsidePages(Url);
          this.getXmlFiles(this.currentTranslations[0]);
        } else {
          this.getXmlFiles(this.currentTranslations[0]);
        }
      });
  }

  toggleLanguages(pForceHide?: boolean) {
    if (pForceHide) {
      this._showLanguages.next(false);
    } else {
      this._showLanguages.next(!this._showLanguages.getValue());
    }
  }

  next() {
    this.tagline = '';
    this.Cards = [];
    this.cardsContent = [];
    if (this.counter < this.allPages.length - 1) {
      this.counter++;
      this.pageGetparameters.pageid = this.counter;
      const Url = this.router
        .createUrlTree([
          '/page/new/rendered',
          this.lang,
          this.BookID,
          this.counter
        ])
        .toString();
      this.router.navigateByUrl(Url.toString());
      this.loadPage(this.counter, Url);

      window.scrollTo(0, 0);
    } else {
      this.pageGetparameters.pageid = null;
    }
  }

  previous() {
    this.tagline = '';
    this.Cards = [];
    this.cardsContent = [];
    this.currentPageContent = {};
    this.tagline = '';

    if (this.counter > 1) {
      this.counter--;
      this.pageGetparameters.pageid = this.counter;
    } else {
      this.pageGetparameters.pageid = null;
      this.counter = 0;
    }

    const Url = this.router
      .createUrlTree([
        '/page/new/rendered',
        this.lang,
        this.BookID,
        this.counter
      ])
      .toString();
    this.router.navigateByUrl(Url.toString());
    this.loadPage(this.counter, Url);
    window.scrollTo(0, 0);
  }

  formAction(inputFunctionName) {
    let functionName = inputFunctionName;

    if (functionName.indexOf(' ') > -1) {
      var splitname = functionName.split(' ');

      if (splitname[0].indexOf(':') > -1) functionName = splitname[1].trim();
      else functionName = splitname[0];
    }

    if (
      this.currentPageContent.items &&
      this.currentPageContent.items.cards &&
      this.currentPageContent.items.cards.length > 0
    ) {
      const _tCards = this.currentPageContent.items.cards;
      let show_card = _tCards.filter(row => {
        return row.listeners && row.listeners == functionName;
      });

      //display form card
      if (show_card.length > 0) {
        show_card[0].hidden = false;
        this.displayForm = true;

        //hide other regular cards
        let other_cards = _tCards.filter(row => {
          return !row.listeners || row.listeners != functionName;
        });

        //clear other contents
        this.tagline = '';
        this.summary_line = '';
        this.multiple_summary_line = [];
        this.paras = [];
        this.call_to_action = '';
        this.currentPageContent.heading = show_card[0].label.text;

        other_cards.forEach(card => {
          card.hidden = true;
        });
      }

      let hide_card = _tCards.filter(row => {
        return row.dismissListeners && row.dismissListeners == functionName;
      });

      //closing form
      if (hide_card.length > 0) {
        hide_card[0].hidden = true;
        this.displayForm = false;

        let other_cards = _tCards.filter(row => {
          return !row.dismissListeners || row.dismissListeners != functionName;
        });

        other_cards.forEach(card => {
          card.hidden = false;
        });

        this.next();
      }
    }

    if (
      this.currentPageContent.items &&
      this.currentPageContent.items.modals &&
      this.currentPageContent.items.modals.length > 0
    ) {
      const _tModals = this.currentPageContent.items.modals;
      let show_modal = _tModals.filter(row => {
        return row.listeners && row.listeners == functionName;
      });

      //show modal
      if (show_modal.length > 0) {
        this.clearContent();
        this.displayModal = true;
        //this.LoadModal(show_modal[0]);
      }

      let hide_modal = _tModals.filter(row => {
        return row.dismissListeners && row.dismissListeners == functionName;
      });

      //hide modal
      if (hide_modal.length > 0) {
        this.next();
      }
    }
  }

  private toggleLoader(pShow: boolean): void {
    this.loaderService.display(pShow);
  }

  private watchPageParameters(): void {
    this.route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.toggleLoader(true);
        if (params['bookid'] && params['langid'] && params['page']) {
          this.pageGetparameters.bookid = params['bookid'];
          this.pageGetparameters.langid = params['langid'];
          this.pageGetparameters.pageid = Number(params['page']);
          this.setSelectedPage(params['page']);
          this.counter = Number(params['page']);
        } else if (params['bookid'] && params['langid']) {
          this.pageGetparameters.bookid = params['bookid'];
          this.pageGetparameters.langid = params['langid'];
        } else if (params['bookid']) {
          this.pageGetparameters.bookid = params['bookid'];
        }
      });
  }

  /*To get all languages*/
  private getAllLanguages() {
    this.commonService
      .getLanguages(APIURL.GET_ALL_LANGUAGES)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        this.allLanguages = data.data;
      });
  }

  /*To get all books*/
  private getAllBooks() {
    this.commonService
      .getBooks(APIURL.GET_ALL_BOOKS)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        this.allBooks = data.data;
        if (this.pageGetparameters.bookid) {
          this.allBooks.forEach(x => {
            if (x.attributes.abbreviation == this.pageGetparameters.bookid) {
              setTimeout(() => {
                this.selectBook(x, false);
              }, 100);
            }
          });
        }
      });
  }

  private selectBook(book, fromChoice = false) {
    this.toggleLoader(true);
    this.selectLan = '';
    this.BookID = book.attributes.abbreviation;
    this.selectedBookLanguauageTranslations = [];

    if (fromChoice == true) {
      this.pageGetparameters.pageid = 0;
      this.counter = 0;
    }
    this.pageNames = [];
    this.clearContent();

    this.selectbook = book.attributes.name;
    this.selectedBookId = book.id;
    console.log("[PAGEREND]:selectbook:", this.selectbook, book);

    this.getIndex();
  }

  private getIndex() {
    this.commonService
      .downloadFile(APIURL.GET_INDEX_FILE.replace('{0}', this.selectedBookId))
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        /*Convertion of array buffer to xml*/
        let enc = new TextDecoder('utf-8');
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);

        /*convertion of xml to json*/
        let jsondata = JSON.parse(result);
        this.IndexContent = jsondata;

        if (this.IndexContent.data['attributes']['resource-type'] == 'tract') {
          this.currentBookTranslations = [];
          this.IndexContent.data.relationships[
            'latest-translations'
          ].data.forEach(translation => {
            var required = this.IndexContent.included.filter(row => {
              if (row.type == 'translation' && row.id == translation.id)
                return true;
              else return false;
            });

            required.forEach(element => {
              this.currentBookTranslations.push(element);
            });
          });
          this.getLanguageTranslationsForSelectedBook();
        }
        this.selectLanguage('', false);
      });
  }

  private translationsMapper(booktranslations, languagetranslations) {
    this.currentTranslations = [];
    for (let j = 0; j < languagetranslations.length; j++) {
      for (let i = 0; i < booktranslations.length; i++) {
        if (
          this.currentBookTranslations[i].id ==
          this.currentLanguageTransalations[j].id
        ) {
          this.currentTranslations.push(this.currentBookTranslations[i]);
        }
      }
    }
  }

  private clearContent() {
    this.tagline = '';
    this.summary_line = '';
    this.Cards = [];
    this.cardsContent = [];
    this.currentPageContent = {};
    this.multiple_summary_line = [];
    this.paras = [];
    this.call_to_action = '';
    this.isFirstPage = false;
    this.isLastPage = false;
  }

  private setSelectedPage(pageid) {
    this.tagline = '';
    this.Cards = [];
    this.cardsContent = [];
    this.tagline = '';

    if (this.counter < this.allPages.length) {
      this.counter++;
      this.loadPage(pageid);
    }
  }

  private currentPage() {
    this.tagline = '';
    this.Cards = [];
    this.cardsContent = [];
    this.tagline = '';
    this.currentPageContent = {};
    this.loadPage(this.counter);
  }

  /*Language translations for selected book*/
  private getLanguageTranslationsForSelectedBook() {
    this._showNoRecordFound.next(false);
    this._hasError.next(false);
    this.errorMsg = '';
    this.selectedBookLanguauageTranslations = [];
    this.selectLan = '';
    this.tagline = '';
    this.summary_line = '';
    this.Cards = [];
    this.cardsContent = [];
    this.currentPageContent = {};
    this.multiple_summary_line = [];

    this.allLanguagesTranslations = this.allLanguages;
    for (let i = 0; i < this.allLanguagesTranslations.length; i++) {
      let language;
      let currentIterationTranslations = this.allLanguagesTranslations[i]
        .relationships.translations.data;
      for (let j = 0; j < currentIterationTranslations.length; j++) {
        for (let k = 0; k < this.currentBookTranslations.length; k++) {
          if (
            this.currentBookTranslations[k].id ==
            currentIterationTranslations[j].id
          ) {
            language = this.allLanguagesTranslations[i];
          }
        }
      }
      if (language !== undefined) {
        this.selectedBookLanguauageTranslations.push(language);
      }
    }

    this._hasLanguages.next(this.selectedBookLanguauageTranslations.length > 0);
    setTimeout(() => {
      this._showNoRecordFound.next(this.checkIfPreSelectedLanguageExists());
    }, 0);
  }

  private checkIfPreSelectedLanguageExists() {
    if (this.pageGetparameters.langid) {
      let x = this.selectedBookLanguauageTranslations.find(
        x => x.attributes.code == this.pageGetparameters.langid
      );
      return x && x.length > 0;
    } else {
      return true;
    }
  }

  private getXmlFiles(id) {
    if (id === undefined) return;
    let manifest_name = id.attributes['manifest-name'];
    if (manifest_name == null) {
      console.log('Manifest name not specified in index file');
      this.clearContent();
      this.errorMsg = 'Problem loading book content.';
      this._hasError.next(true);
      setTimeout(() => {
        this.toggleLoader(false);
      }, 0);
      return;
    } else if (manifest_name) {
      let translationId = id.id;
      this.commonService
        .downloadFile(
          APIURL.GET_XML_FILES_FOR_MANIFEST +
            translationId +
            '/' +
            manifest_name
        )
        .pipe(
          takeUntil(this._unsubscribeAll),
          takeUntil(this._stopLoad)
        )
        .subscribe(
          data => {
            /*Convertion of array buffer to xml*/
            let enc = new TextDecoder('utf-8');
            let arr = new Uint8Array(data);
            let result = enc.decode(arr);

            /*convertion of xml to json*/
            const parser = new DOMParser();
            const xml = parser.parseFromString(result, 'text/xml');
            let jsondata = this.ngxXml2jsonService.xmlToJson(xml);

            /* All Pages in xml file */
            if (jsondata['manifest']['pages']['page'] == undefined) {
              console.log('No pages defined for book in manifest');
              this.errorMsg = 'Problem loading book content.';
              this._hasError.next(true);
              setTimeout(() => {
                this.toggleLoader(false);
              }, 0);
            }

            if (
              jsondata['manifest']['pages']['page'] &&
              jsondata['manifest']['pages']['page'].length != undefined &&
              jsondata['manifest']['pages']['page'].length > 0
            ) {
              this.pageCount = jsondata['manifest']['pages']['page'].length;

              for (
                let j = 0;
                j < jsondata['manifest']['pages']['page'].length;
                j++
              ) {
                this.page.filename =
                  jsondata['manifest']['pages']['page'][j]['@attributes'][
                    'filename'
                  ];
                this.page.src =
                  jsondata['manifest']['pages']['page'][j]['@attributes'][
                    'src'
                  ];
                this.page.translationId = translationId;
                this.pages.push(this.page);
                this.allPages = [];
                //this.allResourcesImages = [];
                this.getXmlFileForEachPage(this.page);
                this.pageNames.push(this.page.filename); //push page name in order
                this.page = { filename: '', src: '', translationId: '' };
              }

              /*All resources in xml file*/
              for (
                let j = 0;
                j < jsondata['manifest']['resources']['resource'].length;
                j++
              ) {
                this.resource.filename =
                  jsondata['manifest']['resources']['resource'][j][
                    '@attributes'
                  ]['filename'];
                this.resource.src =
                  jsondata['manifest']['resources']['resource'][j][
                    '@attributes'
                  ]['src'];
                this.resource.translationId = translationId;
                this.pages.push(this.resource);
                this.resources.push(this.resource);
                this.resource = { filename: '', src: '', translationId: '' };
              }
            }
          },
          err => {
            console.log('Error reading manifest file.');
            this.errorMsg = 'Problem loading book content.';
            this._hasError.next(true);
            setTimeout(() => {
              this.toggleLoader(false);
            }, 0);
          }
        );
    }
  }

  private getXmlFileForEachPage(page) {
    this.commonService
      .downloadFile(
        APIURL.GET_XML_FILES_FOR_MANIFEST + page.translationId + '/' + page.src
      )
      .subscribe((data: any) => {
        // Convertion of array buffer to xml
        let enc = new TextDecoder('utf-8');
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);

        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'application/xml');

        const _tTractPage: TractPage = new TractPage(xml);
        if (_tTractPage && _tTractPage.content) {
          _tTractPage.content.pagename = page.filename;
          this.getImagesForPage(_tTractPage);
          this.allPages.push(_tTractPage.content);
        }

        if (this.pageCount == this.allPages.length) {
          this.currentPage();
          setTimeout(() => {
            this.toggleLoader(false);
          }, 0);
        }
      });
  }

  private getImagesForPage(pPage: TractPage): void {
    if (
      pPage.content &&
      pPage.content.items &&
      pPage.content.items.hero &&
      pPage.content.items.hero.items &&
      pPage.content.items.hero.items.length > 0
    ) {
      for (let i = 0; i < pPage.content.items.hero.items.length; i++) {
        if (
          pPage.content.items.hero.items[i].elements.items &&
          pPage.content.items.hero.items[i].elements.items.length > 0
        ) {
          for (
            let j = 0;
            j < pPage.content.items.hero.items[i].elements.items.length;
            j++
          ) {
            if (
              pPage.content.items.hero.items[i].elements.items[j].type ===
              'image'
            ) {
              (pPage.content.items.hero.items[i].elements.items[j]
                .content as IPageImageContent).resource = this.getImage(
                (pPage.content.items.hero.items[i].elements.items[j]
                  .content as IPageImageContent).resource
              );
            }
          }
        }
      }
    }

    if (
      pPage.content &&
      pPage.content.items &&
      pPage.content.items.cards &&
      pPage.content.items.cards.length > 0
    ) {
      for (let c = 0; c < pPage.content.items.cards.length; c++) {
        if (
          pPage.content.items.cards[c].items &&
          pPage.content.items.cards[c].items.length > 0
        ) {
          for (let i = 0; i < pPage.content.items.cards[c].items.length; i++) {
            if (
              pPage.content.items.cards[c].items[i].elements.items &&
              pPage.content.items.cards[c].items[i].elements.items.length > 0
            ) {
              for (
                let j = 0;
                j < pPage.content.items.cards[c].items[i].elements.items.length;
                j++
              ) {
                if (
                  pPage.content.items.cards[c].items[i].elements.items[j]
                    .type === 'image'
                ) {
                  (pPage.content.items.cards[c].items[i].elements.items[j]
                    .content as IPageImageContent).resource = this.getImage(
                    (pPage.content.items.cards[c].items[i].elements.items[j]
                      .content as IPageImageContent).resource
                  );
                }
              }
            }
          }
        }
      }
    }

    if (
      pPage.content &&
      pPage.content.items &&
      pPage.content.items.modals &&
      pPage.content.items.modals.length > 0
    ) {
      for (let c = 0; c < pPage.content.items.modals.length; c++) {
        if (
          pPage.content.items.modals[c].items &&
          pPage.content.items.modals[c].items.length > 0
        ) {
          for (let i = 0; i < pPage.content.items.modals[c].items.length; i++) {
            if (
              pPage.content.items.modals[c].items[i].elements.items &&
              pPage.content.items.modals[c].items[i].elements.items.length > 0
            ) {
              for (
                let j = 0;
                j <
                pPage.content.items.modals[c].items[i].elements.items.length;
                j++
              ) {
                if (
                  pPage.content.items.modals[c].items[i].elements.items[j]
                    .type === 'image'
                ) {
                  (pPage.content.items.modals[c].items[i].elements.items[j]
                    .content as IPageImageContent).resource = this.getImage(
                    (pPage.content.items.modals[c].items[i].elements.items[j]
                      .content as IPageImageContent).resource
                  );
                }
              }
            }
          }
        }
      }
    }
  }

  private getImage(resource) {
    if (resource == undefined || resource == '' || resource == null) return '';

    if (this.IndexContent != undefined && this.IndexContent != null) {
      var attachments = this.IndexContent.included.filter(row => {
        if (
          row.type.toLowerCase() == 'attachment' &&
          row.attributes['file-file-name'].toLowerCase() ==
            resource.toLowerCase()
        )
          return true;
        else return false;
      });

      if (attachments.length == 0) {
        console.log('getImages: Image not found in index file');
        return '';
      }

      var filename = attachments[0].attributes.file;

      //add name to prefetch
      let link = document.createElement('link');
      link.href = filename;
      link.rel = 'prefetch';
      document.getElementsByTagName('head')[0].appendChild(link);

      return filename;
    }
  }

  private loadPage(pageid, url?) {
    this.displayForm = false;
    this.displayModal = false;

    this.clearContent();
    this.counter = pageid;

    let page_name = this.pageNames[pageid];

    this.counter == 0 ? (this.isFirstPage = true) : (this.isFirstPage = false);

    this.counter == this.allPages.length - 1
      ? (this.isLastPage = true)
      : (this.isLastPage = false);

    let selected_page = this.allPages.filter(row => {
      return row.pagename == page_name;
    });

    if (selected_page.length == 0) {
      if (this.currentPageContent == undefined) {
        return;
      }
    }

    this.currentPageContent = selected_page[0];

    /*
    if (this.currentPageContent && this.currentPageContent.header) {
      this.currentPageContent.heading = this.currentPageContent.header.title[
        'content:text'
      ];
    }

    if (this.currentPageContent === undefined) {
      console.log('Page not header found to load : ' + pageid);
      return;
    }

    if (this.currentPageContent.paragraph['content:paragraph'] != undefined) {
      this.summary_line = this.currentPageContent.paragraph[
        'content:paragraph'
      ]['content:text'];
      if (typeof this.summary_line != 'string') {
        this.multiple_summary_line = this.summary_line;
        this.summary_line = '';
      }
    } else this.summary_line = '';    

    this.call_to_action = this.currentPageContent.call_to_action;
    this.paras = this.currentPageContent.paras;

    if (this.currentPageContent.cards.length > 0) {
      this.Modals = this.currentPageContent.modals;
      this.Cards = this.currentPageContent.cards;
      for (let i = 0; i < this.Cards.length; i++) {
        if (
          (this.Cards[i].listener == '' && this.Cards[i].dismiss == '') ||
          this.Cards[i].forms.length == 0
        )
          this.Cards[i].hidden = false;
        else this.Cards[i].hidden = true;
      }
    }

    if (
      this.currentPageContent.header != null &&
      this.currentPageContent.header.number != null
    ) {
      this.headerCounter = this.currentPageContent.header.number[
        'content:text'
      ];
    } else {
      this.headerCounter = null;
    }
    */
    this.toggleLoader(false);
    /*if (url) this.analyticsService.runAnalyticsInsidePages(url);*/
  }
}
