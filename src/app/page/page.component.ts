import { Component, OnInit, HostListener } from '@angular/core';
import { CommonService } from '../services/common.service';
import { APIURL, MOBILE_CONTENT_API_WS_URL } from '../api/url';
import { TextDecoder } from '../../../node_modules/text-encoding/index.js';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Location, ViewportScroller } from '@angular/common';
import { LoaderService } from '../services/loader-service/loader.service';
import { AnalyticsService } from '../services/analytics.service';
import { isArray } from 'util';
import * as ActionCable from '@rails/actioncable';

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
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit {
  showLoader: boolean;
  bookid: any;
  loading: boolean = false;
  myUrl: string;
  bookname: any;
  IndexContent: any;
  selectedBookLanguauageTranslations = [];
  allLanguagesTranslations: any;
  currentPageContent: any;
  language: boolean = false;
  showNoRecordFound = false;
  errorpresent = false;
  errorMsg = '';
  books: boolean = false;
  currentTranslations = [];
  currentBookTranslations = [];
  currentLanguageTransalations = [];
  selectedBookId: any;
  selectedLanguageId: any;
  allBooks: any;
  allLanguages: any;
  selectLan: any;
  selectbook: any;
  pageNames = [];
  pageCount = 0;
  displayForm = false;
  displayModel = false;
  page = {
    translationId: '',
    filename: '',
    src: ''
  };
  resource = {
    translationId: '',
    filename: '',
    src: ''
  };
  counter = 0;
  pages = [];
  resources = [];
  pageContents = [];
  AllPagesContent = [];
  FirstPage = false;
  LastPage = false;
  headerCounter;

  currentYear = new Date().getFullYear();

  private sub: any;
  private liveShareSubscription: ActionCable.Channel;
  constructor(
    public commonService: CommonService,
    private ngxXml2jsonService: NgxXml2jsonService,
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    public router: Router,
    public location: Location,
    private loaderService: LoaderService,
    private analyticsService: AnalyticsService,
    private viewportScroller: ViewportScroller
  ) {
    this.showLoader = true;
    this.AllBooks();
    this.AllLanguages();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.liveShareSubscription && this.liveShareSubscription.unsubscribe();
  }

  pageGetparameters = {
    bookid: null,
    langid: null,
    pageid: null,
    dir: 'rtl'
  };

  ngOnInit() {
    this.showLoader = false;
    this.loaderService.status.subscribe((val: boolean) => {
      this.showLoader = val;
    });

    if (!Object.entries) {
      Object.entries = function(obj) {
        let ownProps = Object.keys(obj),
          i = ownProps.length,
          resArray = new Array(i); // preallocate the Array
        while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

        return resArray;
      };
    }

    if (this.commonService.selectedLan !== undefined) {
      this.selectLan = this.commonService.selectedLan.attributes.name;
      this.selectedLanguageId = this.commonService.selectedLan.id;
    }

    this.sub = this.route.params.subscribe(params => {
      this.showLoader = true;
      if (params['bookid'] && params['langid'] && params['page']) {
        this.selectedPage(params['page']);
        this.pageGetparameters.bookid = params['bookid'];
        this.pageGetparameters.langid = params['langid'];
        this.pageGetparameters.pageid = Number(params['page']);

        this.counter = Number(params['page']);
      } else if (params['bookid'] && params['langid']) {
        this.pageGetparameters.bookid = params['bookid'];
        this.pageGetparameters.langid = params['langid'];
      } else if (params['bookid']) {
        this.pageGetparameters.bookid = params['bookid'];
      }
      if (this.route.snapshot.fragment) {
        // Wait a tick for new page DOM layout to finish and scrolling to anchor again
        setTimeout(
          () =>
            this.viewportScroller.scrollToAnchor(this.route.snapshot.fragment),
          0
        );
      }
    });
    this.analyticsService.runAnalyticsOnHomepages();

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
            this.router.navigateByUrl(Url.toString());
            this.analyticsService.runAnalyticsInsidePages(Url);
          }
        }
      );
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    let RIGHT_ARROW = 39;
    let LEFT_ARROW = 37;

    if (
      event.keyCode === RIGHT_ARROW &&
      this.counter < this.allPages.length - 1
    ) {
      this.next();
    }

    if (event.keyCode === LEFT_ARROW && this.counter > 0) {
      this.previous();
    }
  }

  /*To get all books*/
  AllBooks() {
    this.commonService.getBooks(APIURL.GET_ALL_BOOKS).subscribe((data: any) => {
      this.allBooks = data.data;
      if (this.pageGetparameters.bookid) {
        this.allBooks.forEach(x => {
          if (x.attributes.abbreviation == this.pageGetparameters.bookid) {
            this.selectBook(x, false);
          }
        });
      }
    });
  }

  /*To get all languages*/
  AllLanguages() {
    this.commonService
      .getLanguages(APIURL.GET_ALL_LANGUAGES)
      .subscribe((data: any) => {
        this.allLanguages = data.data;
      });
  }

  /*Language translations for selected book*/
  LanguagesForSelectedBook() {
    this.showNoRecordFound = false;
    this.errorpresent = false;
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

    this.showNoRecordFound = this.checkIfPreSelectedLanguageExists();
  }

  checkIfPreSelectedLanguageExists() {
    if (this.pageGetparameters.langid) {
      let x = this.selectedBookLanguauageTranslations.find(
        x => x.attributes.code == this.pageGetparameters.langid
      );
      return x && x.length > 0;
    } else {
      return true;
    }
  }

  lang = '';
  selectLanguage(lang, selectChoice = false) {
    this.loaderService.display(true);
    //this.loading = true;
    this.showNoRecordFound = false;
    this.errorpresent = false;
    this.errorMsg = '';
    this.ClearContent();

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
        .createUrlTree([lang.attributes.code, this.BookID], {
          queryParams: this.route.snapshot.queryParams
        })
        .toString();
      this.router.navigateByUrl(Url.toString());
    }
    this.language = false;
    this.selectLan = lang.attributes.name;
    this.commonService.selectedLan = lang;
    this.selectedLanguageId = lang.id;

    this.commonService
      .getLanguages(APIURL.GET_ALL_LANGUAGES + lang.id)
      .subscribe((data: any) => {
        this.currentLanguageTransalations =
          data.data.relationships.translations.data;
        this.translationsMapper(
          this.currentBookTranslations,
          this.currentLanguageTransalations
        );

        if (this.currentTranslations.length === 0) {
          this.errorpresent = true;
          this.errorMsg = 'This book is not available in selected language.';
          this.loaderService.display(false);
          return;
        } else {
          this.errorpresent = false;
        }

        if (this.pageGetparameters.pageid) {
          this.getXmlFiles(
            this.currentTranslations[this.pageGetparameters.pageid]
          );
          const Url = this.router
            .createUrlTree([this.lang, this.BookID, this.counter], {
              queryParams: this.route.snapshot.queryParams
            })
            .toString();
          this.router.navigateByUrl(Url.toString());
          this.analyticsService.runAnalyticsInsidePages(Url);
          this.getXmlFiles(this.currentTranslations[0]);
        } else {
          this.getXmlFiles(this.currentTranslations[0]);
        }
      });
  }

  BookID = '';
  selectBook(book, fromChoice = false) {
    this.loaderService.display(true);
    this.BookID = book.attributes.abbreviation;
    this.selectLan = '';
    this.selectedBookLanguauageTranslations = [];

    if (fromChoice == true) {
      this.pageGetparameters.pageid = 0;
      this.counter = 0;
    }
    this.pageNames = [];
    this.ClearContent();

    this.books = false;
    this.selectbook = book.attributes.name;
    this.selectedBookId = book.id;

    this.getIndex();
  }

  translationsMapper(booktranslations, languagetranslations) {
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

  /*To get xml files for each translation Id*/
  getXmlFiles(id) {
    if (id === undefined) return;
    let manifest_name = id.attributes['manifest-name'];
    if (manifest_name == null) {
      console.log('Manifest name not specified in index file');
      this.ClearContent();
      this.errorpresent = true;
      this.errorMsg = 'Problem loading book content.';
      this.loaderService.display(false);
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
              this.loaderService.display(false);
              this.errorpresent = true;
              this.errorMsg = 'Problem loading book content.';
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
                this.AllPagesContent = [];
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
            this.loaderService.display(false);
            this.errorpresent = true;
            this.errorMsg = 'Problem loading book content.';
          }
        );
    }
  }

  getXmlFileForEachPage(page) {
    this.commonService
      .downloadFile(
        APIURL.GET_XML_FILES_FOR_MANIFEST + page.translationId + '/' + page.src
      )
      .subscribe((data: any) => {
        // Convertion of array buffer to xml
        let enc = new TextDecoder('utf-8');
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);

        let obj = {
          xmlFile: result,
          filename: page.filename,
          translationId: page.translationId,
          src: page.src
        };

        // convertion of xml to json
        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'application/xml');
        let jsondata = this.ngxXml2jsonService.xmlToJson(xml);

        this.objectMapper(jsondata, page.filename);
        this.AllPagesContent.push(jsondata);

        if (this.pageCount == this.AllPagesContent.length) {
          this.currentPage();
          this.loaderService.display(false);
        }
      });
  }

  getIndex() {
    this.commonService
      .downloadFile(APIURL.GET_INDEX_FILE.replace('{0}', this.selectedBookId))
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
          this.LanguagesForSelectedBook();
        }

        this.selectLanguage('', false);
      });
  }

  getImages(resource) {
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

  Languages() {
    this.language = !this.language;
    this.books = false;
  }

  Books() {
    this.language = false;
    this.books = !this.books;
  }

  allPages = [];
  getImageName(contentImage) {
    var ImageName = '';
    var ImagePath = '';
    if (
      contentImage['@attributes']['restrictTo'] == undefined ||
      contentImage['@attributes']['restrictTo'] == null ||
      contentImage['@attributes']['restrictTo'] == 'web'
    ) {
      ImageName = contentImage['@attributes']['resource'];
      ImagePath = this.getImages(ImageName);
      return ImagePath;
    } else return '';
  }

  objectMapper(resourcePage, pagename) {
    let heading,
      card,
      cards,
      paragraph,
      call_to_action,
      obj,
      attributes,
      paras,
      modals;
    obj = {};
    heading = {};
    paragraph = {};
    call_to_action = {};
    cards = [];
    modals = [];

    attributes = {};

    if (resourcePage.page.hero && !this.isRestricted(resourcePage.page.hero)) {
      heading =
        resourcePage.page.hero.heading == undefined ||
        this.isRestricted(resourcePage.page.hero.heading) ||
        this.isRestricted(resourcePage.page.hero.heading['content:text'])
          ? ''
          : resourcePage.page.hero.heading['content:text'];
      obj = resourcePage.page;
      paras = this.getHeroContent(resourcePage.page.hero);
    } else {
      heading = '';
    }

    if (resourcePage.page.header) {
      heading = resourcePage.page.header.title['content:text'];
      obj = resourcePage.page;
      paragraph = '';
      if (resourcePage.page.cards != undefined) {
        if (resourcePage.page.cards.card.length != undefined) {
          for (let i = 0; i < resourcePage.page.cards.card.length; i++) {
            let card = this.getCardContent(resourcePage, i);
            if (!card.isRestricted) {
              cards.push(card);
            }
          }
        } else {
          resourcePage.page.cards.card = [resourcePage.page.cards.card];
          let card = this.getCardContent(resourcePage, 0);
          if (!card.isRestricted) {
            cards.push(card);
          }
        }
      }
    }

    if (resourcePage.page.cards) {
      obj = resourcePage.page;

      if (cards.length == 0) {
        //dont process card, if already done in header
        if (resourcePage.page.cards.card.length != undefined) {
          for (let i = 0; i < resourcePage.page.cards.card.length; i++) {
            let card = this.getCardContent(resourcePage, i);
            if (!card.isRestricted) {
              cards.push(card);
            }
          }
        } else {
          resourcePage.page.cards.card = [resourcePage.page.cards.card];
          let card = this.getCardContent(resourcePage, 0);
          if (!card.isRestricted) {
            cards.push(card);
          }
        }
      }
    }

    if (resourcePage.page.modals) {
      if (resourcePage.page.modals.modal.length == undefined) {
        let modal = this.getModalContent(resourcePage, null);
        if (!this.isRestricted(modal)) {
          modals.push(modal);
        }
      } else {
        for (let i = 0; i < resourcePage.page.modals.modal.length; i++) {
          let modal = this.getModalContent(resourcePage, i);
          if (!this.isRestricted(modal)) {
            modals.push(modal);
          }
        }
      }
    }

    if (resourcePage.page['call-to-action']) {
      obj.call_to_action = resourcePage.page['call-to-action']['content:text'];
    } else obj.call_to_action = '';

    if (typeof obj.call_to_action == 'object') obj.call_to_action = '';

    obj.heading = heading;
    obj.paragraph = paragraph;
    obj.cards = cards;
    obj.paras = paras;
    obj.modals = modals;
    obj.pagename = pagename;
    this.allPages.push(obj);
  }

  getHeroContent(hero) {
    var heropara = [];
    let heroparagraphs = [];

    if (
      hero['content:paragraph'] != undefined &&
      hero['content:paragraph'].length != undefined
    ) {
      hero['content:paragraph'].forEach(tItem => {
        if (!this.isRestricted(tItem)) {
          heroparagraphs.push(tItem);
        }
      });
    } else if (
      hero['content:paragraph'] != undefined &&
      hero['content:paragraph'].length == undefined
    ) {
      if (!this.isRestricted(hero['content:paragraph'])) {
        heroparagraphs.push(hero['content:paragraph']);
      }
    }

    heroparagraphs.forEach(para => {
      const paracontent = {
        type: '',
        text: '',
        image: '',
        url: '',
        events: ''
      };

      //handle texts
      const tParaTexts = this.getParagraphTexts(para);
      tParaTexts.forEach(paraText => {
        heropara.push({ type: 'text', text: paraText });
      });

      let parabuttons = this.getParagraphButtons(para);
      if (parabuttons.length > 0) {
        parabuttons.forEach(pbutton => {
          let pcontent = { type: '', text: '', image: '', url: '', events: '' };
          pcontent.type = 'button';
          pcontent.text = pbutton[0];
          if (pbutton[1]) {
            pcontent.events = pbutton[1];
          } else if (pbutton[2]) {
            pcontent.url = pbutton[2];
          }
          heropara.push(pcontent);
        });
      }

      if (para['content:image'] != undefined) {
        if (
          para['content:image'].length == undefined &&
          !this.isRestricted(para['content:image'])
        ) {
          paracontent.type = 'image';
          paracontent.image = this.getImageName(para['content:image']); //para["content:image"]["@attributes"]["resource"];
          paracontent.text = '';
          paracontent.url = '';
          paracontent.events = '';
          heropara.push(paracontent);
        } else if (para['content:image'].length != undefined) {
          para['content:image'].forEach(heroimage => {
            let pimage = { type: '', text: '', image: '', url: '', events: '' };
            pimage.type = 'image';
            pimage.image = this.getImageName(heroimage); //para["content:image"]["@attributes"]["resource"];
            pimage.text = '';
            pimage.url = '';
            pimage.events = '';
            if (!this.isRestricted(heroimage)) {
              heropara.push(pimage);
            }
          });
        }
      }
    });

    return heropara;
  }

  getCardContent(resourcePage, i) {
    let card = {
      label: '',
      content: [],
      button: [],
      link: [],
      //contenttype: '',
      image: [],
      localImage: [],
      forms: [],
      tabs: [],
      hidden: false,
      listener: '',
      dismiss: '',
      isForm: false,
      contentList: [],
      isRestricted: this.isRestricted(resourcePage.page.cards.card[i])
    };

    if (resourcePage.page.cards.card[i]['@attributes']) {
      if (resourcePage.page.cards.card[i]['@attributes'].hidden)
        card.hidden = resourcePage.page.cards.card[i]['@attributes'].hidden;
      if (resourcePage.page.cards.card[i]['@attributes']['listeners'])
        card.listener =
          resourcePage.page.cards.card[i]['@attributes']['listeners'];
      if (resourcePage.page.cards.card[i]['@attributes']['dismiss-listeners'])
        card.dismiss =
          resourcePage.page.cards.card[i]['@attributes']['dismiss-listeners'];
      if (card.listener != '' && card.dismiss != '') card.isForm = true;
    }

    //handle card heading
    card.label =
      resourcePage.page.cards.card[i].label &&
      !this.isRestricted(resourcePage.page.cards.card[i].label)
        ? resourcePage.page.cards.card[i].label['content:text']
        : '';

    card.contentList.push({
      label: resourcePage.page.cards.card[i].label['content:text']
    });

    //handle card paragraph
    let paragraphs = [];
    if (resourcePage.page.cards.card[i]['content:paragraph']) {
      if (
        resourcePage.page.cards.card[i]['content:paragraph'].length ==
          undefined &&
        !this.isRestricted(resourcePage.page.cards.card[i]['content:paragraph'])
      ) {
        paragraphs.push(resourcePage.page.cards.card[i]['content:paragraph']);
      } else if (
        resourcePage.page.cards.card[i]['content:paragraph'].length != undefined
      ) {
        let _cardParagraphs =
          resourcePage.page.cards.card[i]['content:paragraph'];
        _cardParagraphs.forEach(tItem => {
          if (!this.isRestricted(tItem)) {
            paragraphs.push(tItem);
          }
        });
      }
    }

    for (let j = 0; j < paragraphs.length; j++) {
      var formpara = paragraphs[j];

      //handle texts
      const tParaTexts = this.getParagraphTexts(formpara);
      card.contentList.push({ paragraph: tParaTexts });

      //handle buttons
      let formbuttons = this.getParagraphButtons(formpara);
      if (formbuttons.length > 0) {
        formbuttons.forEach(fbutton => {
          card.button.push(fbutton);
          card.contentList.push({ button: fbutton });
        });
      } else {
        card.button.push('');
      }

      //handle links
      if (formpara['content:link']) {
        if (formpara['content:link'].length == undefined) {
          if (!this.isRestricted(formpara['content:link'])) {
            card.link.push([
              formpara['content:link']['content:text'],
              formpara['content:link']['@attributes'].events
            ]);
            card.contentList.push({
              link: [
                formpara['content:link']['content:text'],
                formpara['content:link']['@attributes'].events
              ]
            });
          }
        } else {
          let _links = formpara['content:link'];
          _links.forEach(_link => {
            if (!this.isRestricted(_link)) {
              card.link.push([
                _link['content:text'],
                _link['@attributes'].events
              ]);
              card.contentList.push({
                link: [_link['content:text'], _link['@attributes'].events]
              });
            }
          });
        }
      } else card.link.push('');

      //handle image
      if (formpara['content:image']) {
        if (formpara['content:image'].length == undefined) {
          if (!this.isRestricted(formpara['content:image'])) {
            card.image.push(this.getImageName(formpara['content:image'])); //(formpara["content:image"]["@attributes"]["resource"]);
            card.contentList.push({
              image: this.getImageName(formpara['content:image'])
            });
          }
        } else {
          var imgArr = [];
          formpara['content:image'].forEach(cardimage => {
            const paracontent = { type: 'image', text: '', image: '' };
            paracontent.image = this.getImageName(cardimage); //para["content:image"]["@attributes"]["resource"];
            if (!this.isRestricted(cardimage)) {
              imgArr.push(paracontent);
            }
          });
          if (imgArr.length > 0) {
            card.image.push(imgArr);
            card.contentList.push({ images: imgArr });
          }
        }
      } else {
        card.image.push('');
      }

      //handle content tabs
      if (
        formpara['content:tabs'] &&
        !this.isRestricted(formpara['content:tabs'])
      ) {
        let tab;
        for (
          let k = 0;
          k < formpara['content:tabs']['content:tab'].length;
          k++
        ) {
          tab = formpara['content:tabs']['content:tab'][k];
          let eachtab = {
            heading: tab['content:label']['content:text'],
            paras: [],
            images: [],
            localImage: [],
            texts: [],
            tabList: []
          };

          Object.entries(tab).forEach(([type, content]) => {
            switch (type) {
              case 'content:paragraph': {
                if (!isArray(content)) {
                  if (!this.isRestricted(content)) {
                    eachtab.tabList.push({
                      paragraph: content['content:text']
                    });
                  }
                } else {
                  Object.entries(content).forEach(([num, attributes]) => {
                    if (!this.isRestricted(attributes)) {
                      eachtab.tabList.push({
                        paragraph: attributes['content:text']
                      });
                    }
                  });
                }
                break;
              }
              case 'content:image': {
                if (!isArray(content)) {
                  if (!this.isRestricted(content)) {
                    eachtab.tabList.push({ image: this.getImageName(content) });
                  }
                } else {
                  Object.entries(content).forEach(([num, attributes]) => {
                    if (!this.isRestricted(attributes)) {
                      eachtab.tabList.push({
                        image: this.getImageName(attributes)
                      });
                    }
                  });
                }
                break;
              }
              case 'content:text': {
                if (!isArray(content)) {
                  eachtab.tabList.push({ text: content });
                } else {
                  Object.entries(content).forEach(tabtext => {
                    eachtab.tabList.push({ text: tabtext });
                  });
                }
                break;
              }
            }
          });

          if (tab['content:paragraph'].length == undefined) {
            if (!this.isRestricted(tab['content:paragraph'])) {
              eachtab.paras.push(tab['content:paragraph']['content:text']);
            }
          } else {
            tab['content:paragraph'].forEach(tabpara => {
              if (!this.isRestricted(tabpara)) {
                eachtab.paras.push(tabpara['content:text']);
              }
            });
          }

          //this.sanitizer.bypassSecurityTrustUrl(localStorage.getItem(this.Cards[i].image[j]))
          if (tab['content:image'].length == undefined) {
            if (!this.isRestricted(tab['content:image'])) {
              eachtab.images.push(this.getImageName(tab['content:image']));
            }
          } else {
            tab['content:image'].forEach(tabimage => {
              if (!this.isRestricted(tabimage)) {
                eachtab.images.push(this.getImageName(tabimage));
              }
            });
          }

          if (tab['content:text'] == undefined) eachtab.texts.push('');
          else if (typeof tab['content:text'] == 'string') {
            eachtab.texts.push(tab['content:text']);
          } else {
            tab['content:text'].forEach(tabtext => {
              eachtab.texts.push(tabtext);
            });
          }
          if (!this.isRestricted(tab)) {
            card.tabs.push(eachtab);
            card.contentList.push({ tab: eachtab });
          }
        }
      }
    }

    //handle forms
    //let htmlelement = {};
    let cardforms = {
      elements: [],
      buttons: [],
      links: []
    };

    let forms = resourcePage.page.cards.card[i]['content:form'];
    if (forms != undefined && !this.isRestricted(forms)) {
      //handle input elements
      let elements = forms['content:input'];
      card.isForm = true;

      if (elements) {
        for (let j = 0; j < elements.length; j++) {
          var formelement = elements[j];
          let htmlelement = {
            name: '',
            type: '',
            value: '',
            required: '',
            label: '',
            placeholder: ''
          };

          if (formelement['@attributes'].name)
            htmlelement.name = formelement['@attributes'].name;
          if (formelement['@attributes'].type)
            htmlelement.type = formelement['@attributes'].type;
          if (formelement['@attributes'].value)
            htmlelement.value = formelement['@attributes'].value;
          if (formelement['@attributes'].required)
            htmlelement.required = formelement['@attributes'].required;
          if (formelement['content:label'])
            htmlelement.label = formelement['content:label']['content:text'];
          if (formelement['content:placeholder'])
            htmlelement.placeholder =
              formelement['content:placeholder']['content:text'];

          cardforms.elements.push(htmlelement);
        }
      }

      //handle form paragraph
      let paragraphs = [];
      if (forms['content:paragraph'] != undefined) {
        if (forms['content:paragraph'].length == undefined) {
          if (!this.isRestricted(forms['content:paragraph'])) {
            paragraphs.push(forms['content:paragraph']);
          }
        } else {
          let _tParagraphs = forms['content:paragraph'];
          _tParagraphs.forEach(_tParagraph => {
            if (!this.isRestricted(_tParagraph)) {
              paragraphs.push(_tParagraph);
            }
          });
        }
      }

      //handle form buttons and links
      for (let j = 0; j < paragraphs.length; j++) {
        var formpara = paragraphs[j];
        var formbuttons = this.getParagraphButtons(formpara);
        if (formbuttons.length > 0) {
          cardforms.buttons = cardforms.buttons.concat(formbuttons);
        }

        if (formpara['content:link']) {
          if (formpara['content:link'].length == undefined) {
            if (!this.isRestricted(formpara['content:link'])) {
              cardforms.links.push([
                formpara['content:link']['content:text'],
                formpara['content:link']['@attributes'].events
              ]);
            }
          } else {
            let _links = formpara['content:link'];
            _links.forEach(_link => {
              if (!this.isRestricted(_link)) {
                cardforms.links.push([
                  _link['content:text'],
                  _link['@attributes'].events
                ]);
              }
            });
          }
        }
      }

      // handle links that are not on the form node
      if (forms['content:link'] != undefined) {
        if (forms['content:link'].length != undefined) {
          for (let index = 0; index < forms['content:link'].length; index++) {
            if (!this.isRestricted(forms['content:link'][index])) {
              cardforms.links.push([
                forms['content:link'][index]['content:text'],
                forms['content:link'][index]['@attributes'].events
              ]);
            }
          }
        } else {
          if (!this.isRestricted(forms['content:link'])) {
            cardforms.links.push([
              forms['content:link']['content:text'],
              forms['content:link']['@attributes'].events
            ]);
          }
        }
      }

      card.forms.push(cardforms);
      card.contentList.push({ cardforms: cardforms });
    }

    return card;
  }

  getModalContent(resourcePage, i) {
    let modal = {
      title: '',
      paras: [
        {
          text: '',
          button: [],
          type: ''
        }
      ],
      listener: '',
      dismiss: ''
    };

    let currentModal =
      i == null
        ? resourcePage.page.modals.modal
        : resourcePage.page.modals.modal[i];

    if (currentModal['@attributes']) {
      if (currentModal['@attributes']['listeners'])
        modal.listener = currentModal['@attributes']['listeners'];
      if (currentModal['@attributes']['dismiss-listeners'])
        modal.dismiss = currentModal['@attributes']['dismiss-listeners'];
    }

    //handle modal heading
    modal.title = currentModal.title['content:text'];

    //handle card paragraph
    let paragraphs = [];
    if (currentModal['content:paragraph']) {
      if (currentModal['content:paragraph'].length == undefined) {
        if (!this.isRestricted(currentModal['content:paragraph'])) {
          paragraphs.push(currentModal['content:paragraph']);
        }
      } else {
        let _tParagraphs = currentModal['content:paragraph'];
        _tParagraphs.forEach(_tParagraph => {
          if (!this.isRestricted(_tParagraph)) {
            paragraphs.push(_tParagraph);
          }
        });
      }
    }

    for (let j = 0; j < paragraphs.length; j++) {
      var modalpara = paragraphs[j];

      //handle texts
      const modalParaTexts = this.getParagraphTexts(modalpara);
      modalParaTexts.forEach(modalParaText => {
        modal.paras.push({ text: modalParaText, button: [], type: 'text' });
      });

      //handle buttons
      var modalbuttons = this.getParagraphButtons(modalpara);
      if (modalbuttons.length > 0) {
        modalbuttons.forEach(mbutton => {
          modal.paras.push({
            text: '',
            type: 'button',
            button: mbutton
          });
        });
      }
    }

    return modal;
  }

  Cards = [];
  Modals = [];
  cardsContent = [];
  paras = [];
  call_to_action = '';
  summary_line: any;
  multiple_summary_line = [];
  paraGraph;
  image;
  tagline;

  currentPage() {
    this.tagline = '';
    this.Cards = [];
    this.cardsContent = [];
    this.tagline = '';
    this.currentPageContent = {};
    this.LoadPage(this.counter);
  }

  next() {
    this.tagline = '';
    this.Cards = [];
    this.cardsContent = [];
    if (this.counter < this.allPages.length - 1) {
      this.counter++;
      this.pageGetparameters.pageid = this.counter;
      const Url = this.router
        .createUrlTree([this.lang, this.BookID, this.counter], {
          queryParams: this.route.snapshot.queryParams
        })
        .toString();
      this.router.navigateByUrl(Url.toString());
      this.LoadPage(this.counter, Url);

      this.viewportScroller.scrollToPosition([0, 0]);
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
      .createUrlTree([this.lang, this.BookID, this.counter], {
        queryParams: this.route.snapshot.queryParams
      })
      .toString();
    this.router.navigateByUrl(Url.toString());
    this.LoadPage(this.counter, Url);
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  selectedPage(pageid) {
    this.tagline = '';
    this.Cards = [];
    this.cardsContent = [];
    this.tagline = '';

    if (this.counter < this.allPages.length) {
      this.counter++;
      this.LoadPage(pageid);
    }
  }

  isArray(item) {
    var retValue = true;
    if (item == undefined) retValue = false;
    if (typeof item == 'string') retValue = false;
    return retValue;
  }

  isString(val) {
    return typeof val === 'string';
  }

  ClearContent() {
    this.tagline = '';
    this.summary_line = '';
    this.Cards = [];
    this.cardsContent = [];
    this.currentPageContent = {};
    this.multiple_summary_line = [];
    this.paras = [];
    this.call_to_action = '';
    this.FirstPage = false;
    this.LastPage = false;
  }

  LoadPage(pageid, url?) {
    this.displayForm = false;
    this.displayModel = false;

    this.ClearContent();
    this.counter = pageid;

    //get page name from id
    //What if pageid donot exist
    let page_name = this.pageNames[pageid];

    this.counter == 0 ? (this.FirstPage = true) : (this.FirstPage = false);

    this.counter == this.allPages.length - 1
      ? (this.LastPage = true)
      : (this.LastPage = false);

    let selected_page = this.allPages.filter(row => {
      return row.pagename == page_name;
    });

    if (selected_page.length == 0) {
      if (this.currentPageContent == undefined) {
        return;
      }
    }

    this.currentPageContent = selected_page[0];
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

    this.showLoader = false;
    if (url) this.analyticsService.runAnalyticsInsidePages(url);
  }

  onSubmitSubscriberInfo(form) {
    const subscriberData = {
      data: {
        type: 'follow_up',
        attributes: {
          name: form.value.name,
          email: form.value.email,
          language_id: Number(this.selectedLanguageId),
          destination_id: Number(form.value.destination_id)
        }
      }
    };

    this.commonService.createSubscriber(subscriberData).subscribe();
  }

  formAction(inputFunctionName) {
    let functionName = inputFunctionName;

    if (functionName.indexOf(' ') > -1) {
      var splitname = functionName.split(' ');

      if (splitname[0].indexOf(':') > -1) functionName = splitname[1].trim();
      else functionName = splitname[0];
    }

    let show_card = this.Cards.filter(row => {
      return row.listener == functionName;
    });

    //display form card
    if (show_card.length > 0) {
      show_card[0].hidden = false;
      this.displayForm = true;

      //hide other regular cards
      let other_cards = this.Cards.filter(row => {
        return row.listener != functionName;
      });

      //clear other contents
      this.tagline = '';
      this.summary_line = '';
      this.multiple_summary_line = [];
      this.paras = [];
      this.call_to_action = '';
      this.currentPageContent.heading = show_card[0].label;

      other_cards.forEach(card => {
        card.hidden = true;
      });
    }

    let hide_card = this.Cards.filter(row => {
      return row.dismiss == functionName;
    });

    //closing form
    if (hide_card.length > 0) {
      this.next();
    }

    let show_modal = this.Modals.filter(row => {
      return row.listener == functionName;
    });

    //show modal
    if (show_modal.length > 0) {
      this.LoadModal(show_modal[0]);
    }

    let hide_modal = this.Modals.filter(row => {
      return row.dismiss == functionName;
    });

    //show modal
    if (hide_modal.length > 0) {
      this.next();
    }
  }

  LoadModal(modal) {
    this.ClearContent();
    this.displayModel = true;
  }

  hostnameUrlFromLink(link) {
    let parser = document.createElement('a');
    if (!link.startsWith('http://') || !link.startsWith('https://')) {
      link = `http://${link}`;
    }
    parser.href = link;
    let hostnameFromLink = parser.hostname;
    return hostnameFromLink;
  }

  getParagraphTexts(paragraph): Array<string> {
    let _tTexts = [];

    if (paragraph['content:text'] != undefined) {
      const tParaText = paragraph['content:text'];
      if (tParaText && !Array.isArray(tParaText)) {
        if (!this.isRestricted(tParaText)) {
          const _tDisplayText: string = (tParaText as string).replace(
            /(?:\r\n|\r|\n)/g,
            '<br>'
          );
          _tTexts.push(_tDisplayText);
        }
      } else if (tParaText && Array.isArray(tParaText)) {
        tParaText.forEach(tText => {
          if (!this.isRestricted(tText)) {
            const _tDisplayText: string = (tText as string).replace(
              /(?:\r\n|\r|\n)/g,
              '<br>'
            );
            _tTexts.push(_tDisplayText);
          }
        });
      }
    }

    return _tTexts;
  }

  getParagraphButtons(paragraph): Array<any> {
    var _pButtons = [];

    if (paragraph['content:button']) {
      if (
        paragraph['content:button'].length == undefined &&
        !this.isRestricted(paragraph['content:button'])
      ) {
        const _btn_text = paragraph['content:button']['content:text'];
        const _btn_events =
          paragraph['content:button']['@attributes'] == undefined
            ? ''
            : paragraph['content:button']['@attributes'].events;
        const _btn_is_url =
          paragraph['content:button']['@attributes'] &&
          paragraph['content:button']['@attributes'].type &&
          paragraph['content:button']['@attributes'].type === 'url' &&
          paragraph['content:button']['@attributes'].url;
        const _btn_url = _btn_is_url
          ? paragraph['content:button']['@attributes'].url
          : '';
        let _btn = [];

        if (_btn_is_url) {
          _btn = [_btn_text, '', this.toAbsoluteUrl(_btn_url)];
        } else {
          _btn = [_btn_text, _btn_events, ''];
        }

        _pButtons.push(_btn);
      } else if (paragraph['content:button'].length != undefined) {
        const _buttons = paragraph['content:button'];
        _buttons.forEach(_button => {
          if (!this.isRestricted(_button)) {
            const _btn_text = _button['content:text'];
            const _btn_events =
              _button['@attributes'] == undefined
                ? ''
                : _button['@attributes'].events;
            const _btn_is_url =
              _button['@attributes'] &&
              _button['@attributes'].type &&
              _button['@attributes'].type === 'url' &&
              _button['@attributes'].url;
            const _btn_url = _btn_is_url ? _button['@attributes'].url : '';

            let _btn = [];
            if (_btn_is_url) {
              _btn = [_btn_text, '', this.toAbsoluteUrl(_btn_url)];
            } else {
              _btn = [_btn_text, _btn_events, ''];
            }
            _pButtons.push(_btn);
          }
        });
      }
    }

    return _pButtons;
  }

  private toAbsoluteUrl(link: string): string {
    if (!link || link.trim().length === 0) {
      return '';
    }
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      link = `http://${link}`;
    }
    return link;
  }

  private isRestricted(pItem: any): boolean {
    return (
      pItem['@attributes'] &&
      pItem['@attributes']['restrictTo'] &&
      pItem['@attributes']['restrictTo'] != 'web'
    );
  }
}
