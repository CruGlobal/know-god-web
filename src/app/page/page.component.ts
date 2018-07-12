import { Component, OnInit } from '@angular/core';
import { CommonService } from '../services/common.service';
import { APIURL } from '../api/url';
import { TextDecoder } from '../../../node_modules/text-encoding/index.js';
import { Parser } from 'xml2js';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { isArray } from 'util';
import { Location } from '@angular/common';
import { LoaderService } from '../services/loader-service/loader.service';

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
  languageSelected: any;
  bookname: any;
  allResourcesImages: any;
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
  jsonXmlFiles = [];
  selectedBookId: any;
  selectedLanguageId: any;
  allBooks: any;
  allLanguages: any;
  selectLan: any;
  selectbook: any;
  pageNames = [];
  page = {
    translationId: "",
    filename: "",
    src: ""
  };
  resource = {
    translationId: "",
    filename: "",
    src: ""
  };
  counter = 0;
  pages = [];
  resources = [];
  pageContents = [];
  AllPagesContent = [];
  private sub: any;
  constructor(public commonService: CommonService,
    private ngxXml2jsonService: NgxXml2jsonService,
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    public router: Router, 
    public location: Location,
    private loaderService: LoaderService
  ) {
    this.AllBooks();

  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  pageGetparameters = {
    bookid: null,
    langid: null,
    pageid: null,
    dir: 'rtl'
  }

  ngOnInit() {

    this.showLoader = false;
    this.loaderService.status.subscribe((val: boolean)=>{
      this.showLoader = val;
    });


    if (this.commonService.selectedLan != undefined) {
      this.selectLan = this.commonService.selectedLan.attributes.name;
      this.selectedLanguageId = this.commonService.selectedLan.id
    }
    
    this.sub = this.route.params.subscribe(params => {
      this.showLoader = true;
      if (params['bookid'] && params['langid'] && params['pageid']) {
        this.selectedPage(params['pageid']);
        this.pageGetparameters.bookid = params['bookid']
        this.pageGetparameters.langid = params['langid']
        this.pageGetparameters.pageid = params['pageid']         
      }
      // else if (params['bookid'] && params['langid']) {
      //     this.selectLanguage(params['langname'], params['langid']);
      // }
      if (params['bookid'] && params['langid'] && params['page']) {
        this.pageGetparameters.bookid = params['bookid']
        this.pageGetparameters.langid = params['langid']
        this.pageGetparameters.pageid = Number(params['page'])
        this.counter = Number(params['page'])
        // this.getCurrentUrl()

      }

      else if (params['bookid'] && params['langid']) {
        this.pageGetparameters.bookid = params['bookid']
        this.pageGetparameters.langid = params['langid']
        // this.getCurrentUrl()
      }


      else if (params['bookid']) {
        this.pageGetparameters.bookid = params['bookid'];
        // this.getCurrentUrl()
      }





    })
  }

  /*To get all books*/
  AllBooks() {
    this.loading = true;
    this.commonService.getBooks(APIURL.GET_ALL_BOOKS)
      .subscribe((data: any) => {
        this.allBooks = data.data;

        if (this.pageGetparameters.bookid) {
          this.allBooks.forEach(x => {

            if (x.attributes.abbreviation == this.pageGetparameters.bookid) {
              this.selectBook(x, false)
            }

          });
        }
        this.loading = false;
      })
  }

  /*To get all languages*/
  AllLanguages() {


    this.loading = true;
    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES)
      .subscribe((data: any) => {
        this.allLanguages = data.data;
        if (this.pageGetparameters.bookid && this.pageGetparameters.langid) {
          this.allLanguages.forEach(x => {

            if (x.attributes.code == this.pageGetparameters.langid) {
              this.selectLanguage(x)
            }

          });
        }
        // this.selectedBookLanguauageTranslations = []; 
        this.loading = false;
      })
  }

  /*Language translations for selected book*/
  LanguagesForSelectedBook() {
    this.loading = true;
    this.showNoRecordFound = false;
    this.errorpresent = false;
    this.errorMsg = '';
    this.selectedBookLanguauageTranslations = [];
    this.selectLan = '';
    this.tagline = "";
    this.summary_line = "";
    this.Cards = [];
    this.cardsContent = [];
    this.currentPageContent = {};
    this.multiple_summary_line = [];
    //  this.pageGetparameters.pageid = 0;
    //this.counter = 0;
    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES)
      .subscribe((data: any) => {
        this.allLanguagesTranslations = data.data;
        for (let i = 0; i < this.allLanguagesTranslations.length; i++) {
          let language;
          let currentIterationTranslations = this.allLanguagesTranslations[i].relationships.translations.data;
          for (let j = 0; j < currentIterationTranslations.length; j++) {
            for (let k = 0; k < this.currentBookTranslations.length; k++) {
              if (this.currentBookTranslations[k].id == currentIterationTranslations[j].id) {
                language = this.allLanguagesTranslations[i];
              }
            }
          }
          if (language == undefined) {

          }
          else {
            this.selectedBookLanguauageTranslations.push(language);
          }
        }

        this.showNoRecordFound = this.checkIfPreSelectedLanguageExists();
        this.loading = false;
      })
  }

  checkIfPreSelectedLanguageExists() {
    if (this.pageGetparameters.langid) {
      let x = this.selectedBookLanguauageTranslations.find(x => x.attributes.code == this.pageGetparameters.langid)
      return x && x.length > 0;
    }
    else {
      return true;
    }
  }
  lang = "";
  selectLanguage(lang, selectChoice = false) {
    this.loaderService.display(true);
    this.loading = true;
    this.showNoRecordFound = false;
    this.errorpresent = false;
    this.errorMsg = '';
    this.ClearContent();
    this.lang = lang.attributes.code;
    this.pageGetparameters.langid = lang.attributes.code;
    this.pageGetparameters.dir = lang.attributes.direction;
    if (!this.pageGetparameters.pageid) {
      let Url = this.router.createUrlTree(['/home', this.BookID, lang.attributes.code]).toString();
      this.location.go(Url);
      this.commonService.setCurrentUrl(Url);
    }
    this.language = false;
    this.selectLan = lang.attributes.name;
    this.commonService.selectedLan = lang;
    this.selectedLanguageId = lang.id

    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES + lang.id)
      .subscribe((data: any) => {
        this.currentLanguageTransalations = data.data.relationships.translations.data;
        this.translationsMapper(this.currentBookTranslations, this.currentLanguageTransalations);

        if (this.currentTranslations.length == 0) {
          this.errorpresent = true;
          this.errorMsg = "This book is not available in selected language.";
          this.loaderService.display(false);
          this.loading = false;
          return;
        }
        if (this.pageGetparameters.pageid) {
          this.getXmlFiles(this.currentTranslations[this.pageGetparameters.pageid]);
          let Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
          this.location.go(Url);
          this.commonService.setCurrentUrl(Url);
          this.getXmlFiles(this.currentTranslations[0]);

        }
        else {
          this.getXmlFiles(this.currentTranslations[0]);
          //this.LanguagesForSelectedBook();
          //this.AllLanguages()
        }
        this.loading = false;
      })

    this.currentPage();
  }
  BookID = "";

  // getCurrentUrl() {
  //   let Url = this.router.url;
  //   this.commonService.setCurrentUrl(Url);
  //   console.log(this.router.url);
  // }
  selectBook(book, fromChoice = false) {
    this.loaderService.display(true);
    this.loading = true;
    this.BookID = book.attributes.abbreviation
    this.selectLan = '';
    this.selectedBookLanguauageTranslations = [];

    if (fromChoice == true) {
      this.pageGetparameters.pageid = 0;
      this.counter = 0;
    }
    this.pageNames = [];

    this.ClearContent();

    if (!this.pageGetparameters.langid) {

      let Url = this.router.navigateByUrl('/home/' + book.attributes.abbreviation)
      this.commonService.setCurrentUrl(Url);
      // le																	   
      //let Url = this.router.createUrlTree(['/home', book.attributes.abbreviation]).toString();
      //this.location.go(Url);
    }


    this.books = false;
    this.selectbook = book.attributes.name;
    this.selectedBookId = book.id;


    this.commonService.getBooks(APIURL.GET_ALL_BOOKS + book.id + "?include=translations")
      .subscribe((data: any) => {
        // this.counter=0;
        if (data.data["attributes"]["resource-type"] == "tract") {
          this.currentBookTranslations = data.included;
          this.LanguagesForSelectedBook();
        }

        this.AllLanguages();
        this.loading = false;
      })

  }

  translationsMapper(booktranslations, languagetranslations) {
    this.loading = true;
    this.currentTranslations = [];
    for (let j = 0; j < languagetranslations.length; j++) {
      for (let i = 0; i < booktranslations.length; i++) {
        if (this.currentBookTranslations[i].id == this.currentLanguageTransalations[j].id) {
          this.currentTranslations.push(this.currentBookTranslations[i])
          this.loading = false;
        }
        else {
          // alert('errorrrr')
          //this.showNoRecordFound = true;
        }
      }
    }
  }

  /*To get xml files for each translation Id*/
  getXmlFiles(id) {
    this.loading = true;
    if (id == undefined) return;
    let manifest_name = id.attributes["manifest-name"];
    if (manifest_name == null) {
      console.log('No data')
      this.ClearContent();
      this.showNoRecordFound = true;
      this.loaderService.display(false);
      this.loading = false;
      return;
    }
    else if (manifest_name) {
      let translationId = id.id;
      this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + translationId + "/" + manifest_name)
        .subscribe(data => {

          /*Convertion of array buffer to xml*/
          let enc = new TextDecoder("utf-8");
          let arr = new Uint8Array(data);
          let result = enc.decode(arr);

          /*convertion of xml to json*/
          const parser = new DOMParser();
          const xml = parser.parseFromString(result, 'text/xml');
          let jsondata = this.ngxXml2jsonService.xmlToJson(xml);

          /* All Pages in xml file */
          if (jsondata["manifest"]["pages"]["page"] == undefined) {
            console.log('No pages defined for book in manifest');
            this.loaderService.display(false);
            this.showNoRecordFound = true;
            //return;
          }
          //new code change.

          if (jsondata["manifest"]["pages"]["page"] && jsondata["manifest"]["pages"]["page"].length > 0) {

            for (let j = 0; j < jsondata["manifest"]["pages"]["page"].length; j++) {
              this.page.filename = jsondata["manifest"]["pages"]["page"][j]["@attributes"]["filename"];
              this.page.src = jsondata["manifest"]["pages"]["page"][j]["@attributes"]["src"];
              this.page.translationId = translationId;
              this.pages.push(this.page);
              this.AllPagesContent = [];
              this.allPages = [];
              this.allResourcesImages = [];
              this.getXmlFileForEachPage(this.page);
              console.log('getting xml file loop : ' + this.page.filename)
              this.pageNames.push(this.page.filename); //push page name in order
              this.page = { filename: "", src: "", translationId: "" };
            }

            /*All resources in xml file*/
            for (let j = 0; j < jsondata["manifest"]["resources"]["resource"].length; j++) {
              this.resource.filename = jsondata["manifest"]["resources"]["resource"][j]["@attributes"]["filename"];
              this.resource.src = jsondata["manifest"]["resources"]["resource"][j]["@attributes"]["src"];
              this.resource.translationId = translationId;
              this.pages.push(this.resource);
              this.resources.push(this.resource);
              this.getXmlFileForEachResource(this.resource);
              this.getImages(this.resource);
              this.resource = { filename: "", src: "", translationId: "" };
            }
          }
          // else if (jsondata["manifest"]["pages"].length > 0) {

          //   for (let j = 0; j < jsondata["manifest"]["pages"].length; j++) {
          //     this.page.filename = jsondata["manifest"]["pages"][j]["@attributes"]["filename"];
          //     this.page.src = jsondata["manifest"]["pages"][j]["@attributes"]["src"];
          //     this.page.translationId = translationId;
          //     this.pages.push(this.page);
          //     this.AllPagesContent = [];
          //     this.allPages = [];
          //     this.allResourcesImages = [];
          //     this.getXmlFileForEachPage(this.page);
          //     console.log('getting xml file loop : ' + this.page.filename)
          //     this.pageNames.push(this.page.filename); //push page name in order
          //     this.page = { filename: "", src: "", translationId: "" };
          //   }

          //   /*All resources in xml file*/
          //   for (let j = 0; j < jsondata["manifest"]["resources"].length; j++) {
          //     this.resource.filename = jsondata["manifest"]["resources"][j]["@attributes"]["filename"];
          //     this.resource.src = jsondata["manifest"]["resources"][j]["@attributes"]["src"];
          //     this.resource.translationId = translationId;
          //     this.pages.push(this.resource);
          //     this.resources.push(this.resource);
          //     this.getXmlFileForEachResource(this.resource);
          //     //this.getImages(this.resource);
          //     this.resource = { filename: "", src: "", translationId: "" };
          //   }
          // }
        },
          err => {
            console.log('Error reading manifest file.');
            this.loaderService.display(false);
            this.showNoRecordFound = true;
          });
      this.loading = false;
    }
  }


  getXmlFileForEachPage(page) {
    this.loading = true;
    this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + page.translationId + "/" + page.src)
      .subscribe((data: any) => {

        //Convertion of array buffer to xml
        let enc = new TextDecoder("utf-8");
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);
        let obj = {
          xmlFile: result,
          filename: page.filename,
          translationId: page.translationId,
          src: page.src
        }

        //convertion of xml to json
        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'application/xml');
        let jsondata = this.ngxXml2jsonService.xmlToJson(xml);
        this.objectMapper(jsondata, page.filename);
        this.AllPagesContent.push(jsondata);
        console.log('app page content push: ' + page.filename);
        // window.localStorage["JSONdata"] = jsondata;
        // var accessdata = window.localStorage["JSONdata"];
        // console.log("ACCESSDATA:", accessdata);
        this.loading = false;
      });
  }

  imageUrl
  /*To get images from xml files*/
  getXmlFileForEachResource(resource) {
    this.loading = true;
    this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + resource.translationId + "/" + resource.src)
      .subscribe((data: any) => {
        var data = data;
        var file = new Blob([data], {
          type: 'image/jpeg, image/png, image/gif'
        });
        setTimeout(()=>{ this. currentPage(); this.loaderService.display(false); }, 1000);
        var fileURL = URL.createObjectURL(file);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(fileURL);
        localStorage.setItem(resource.filename, fileURL);
        var imageUrls = { filename: resource.filename, imageUrl: this.imageUrl }
        this.allResourcesImages.push(imageUrls);
        this.loading = false;

      })
  }

  getImages(resource) {
    this.loading = true;
    //this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST+"1061/fedd51055ce5ca6351d19f781601eb94192915597b4b023172acaab4fac04794")
    this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + resource.translationId + "/" + resource.src)
      .subscribe((x: any) => {
        const reader = new FileReader();
        
        if(x instanceof Blob)reader.readAsDataURL(x);
        reader.onloadend = function () {
          //localStorage.set('abc.jpg',reader.result);
          localStorage.set(resource.filename, reader.result);
        };
        this.loading = false;
      })
  }


  Languages() {
    this.language = !this.language;
    this.books = false
  }
  Books() {
    this.language = false;
    this.books = !this.books;

  }

  allPages = [];

  objectMapper(resourcePage, pagename) {
    let heading, card, cards, paragraph, call_to_action, obj, attributes, paras;
    obj = {};
    heading = {};
    paragraph = {};
    call_to_action = {};
    cards = [];

    attributes = {};
    if (resourcePage.page.hero) {
      heading = resourcePage.page.hero.heading == undefined ? '' : resourcePage.page.hero.heading["content:text"];
      paragraph = resourcePage.page.hero;
      obj = resourcePage.page;

      paras = [];
      if (resourcePage.page.hero["content:paragraph"] != undefined && resourcePage.page.hero["content:paragraph"].length != undefined) {
        resourcePage.page.hero["content:paragraph"].forEach(para => {
          var newPara = { type: '', text: '' };
          if (para["content:button"] == undefined) {
            newPara.type = "text";
            newPara.text = para["content:text"];
          } else {
            newPara.type = "button";
            newPara.text = para["content:button"]["content:text"];
          }
          paras.push(newPara)
        });

      }
    }
    if (resourcePage.page.header) {
      heading = resourcePage.page.header.title["content:text"];
      obj = resourcePage.page;
      paragraph = '';
      for (let i = 0; i < resourcePage.page.cards.card.length; i++) {
        let card = this.getCardContent(resourcePage, i);
        cards.push(card);
      }
    }

    if (resourcePage.page.hero && resourcePage.page.cards) {
      heading = resourcePage.page.hero.heading == undefined ? '' : resourcePage.page.hero.heading["content:text"];
      paragraph = resourcePage.page.hero;
      obj = resourcePage.page;

      if (cards.length == 0) { //dont process card, if already done in header
        for (let i = 0; i < resourcePage.page.cards.card.length; i++) {
          let card = this.getCardContent(resourcePage, i);
          cards.push(card);
        }
      }
    }

    if (resourcePage.page["call-to-action"]) {
      obj.call_to_action = resourcePage.page["call-to-action"]["content:text"];
    } else obj.call_to_action = "";

    if (typeof obj.call_to_action == "object") obj.call_to_action = '';

    obj.heading = heading;
    obj.paragraph = paragraph;
    obj.cards = cards;
    obj.paras = paras;
    obj.pagename = pagename;
    this.allPages.push(obj);
    //this.currentPageContent = this.allPages[this.counter];
    if (this.counter) {
      this.currentPage();
    }
    else if (this.counter == 0) {
      this.currentPage();
    }


  }

  getCardContent(resourcePage, i) {

    let card = {
      label: "",
      content: [],
      url: [],
      //contenttype: '',
      image: [],
      localImage: [],
      forms: [],
      tabs: []
    };

    //handle card heading
    card.label = resourcePage.page.cards.card[i].label["content:text"];

    //handle card paragraph 
    let paragraphs = [];
    if (resourcePage.page.cards.card[i]["content:paragraph"].length == undefined) {
      paragraphs.push(resourcePage.page.cards.card[i]["content:paragraph"]);
    } else
      paragraphs = resourcePage.page.cards.card[i]["content:paragraph"];

    for (let j = 0; j < paragraphs.length; j++) {
      var cardpara = paragraphs[j];
      card.content.push(cardpara["content:text"]);

      //handle links
      if (cardpara["content:button"]) {
        card.url.push(cardpara["content:button"]["content:text"]);
      } else card.url.push('');


      //handle image
      if (cardpara["content:image"]) {
        card.image.push(cardpara["content:image"]["@attributes"]["resource"]);
      }
      else {
        card.image.push("");
      }

      //handle content tabs      
      if (cardpara["content:tabs"]) {
        let tab;
        for (let k = 0; k < cardpara["content:tabs"]["content:tab"].length; k++) {
          tab = cardpara["content:tabs"]["content:tab"][k];
          let eachtab = {
            heading: '',
            paras: [],
            images: [],
            localImage: [],
            texts: []
          }
          eachtab.heading = tab["content:label"]["content:text"];

          if (tab["content:paragraph"].length == undefined) eachtab.paras.push(tab["content:paragraph"]["content:text"])
          else {
            tab["content:paragraph"].forEach(tabpara => {
              eachtab.paras.push(tabpara["content:text"])
            });
          }

          //this.sanitizer.bypassSecurityTrustUrl(localStorage.getItem(this.Cards[i].image[j]))
          if (tab["content:image"].length == undefined) eachtab.images.push(tab["content:image"]["@attributes"]["resource"])
          else {
            tab["content:image"].forEach(tabimage => {
              eachtab.images.push(tabimage["content:text"])
            });
          }

          if (tab["content:text"] == undefined) eachtab.texts.push('');
          else if (typeof tab["content:text"] == 'string') eachtab.texts.push(tab["content:text"])
          else {
            tab["content:text"].forEach(tabtext => {
              eachtab.texts.push(tabtext)
            });
          }
          card.tabs.push(eachtab);

        }
      }

    }

    //handle forms
    let forms = resourcePage.page.cards.card[i]["content:form"];
    if (forms != undefined) {
      //   for (var prop in forms) {
      //     if (!forms.hasOwnProperty(prop)) { 
      //         continue;
      //     }

      //      console.log(prop.toString()) 
      // } 
    }


    return card;
  }

  Cards = [];
  cardsContent = [];
  paras = [];
  call_to_action = '';
  summary_line: any;
  multiple_summary_line = [];
  paraGraph;
  image;
  tagline;

  currentPage() {
    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];
    this.tagline = "";
    this.currentPageContent = {};
    this.LoadPage(this.counter);
  }
  pageCount = ""
  next() {
    this.loading = true;
    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];

    if (this.counter < this.allPages.length - 1) {
      this.counter++;
      this.pageGetparameters.pageid = this.counter;
      let Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
      this.location.go(Url);
      this.commonService.setCurrentUrl(Url);
      this.LoadPage(this.counter);
      //$('html, body').animate({ scrollTop: 0 }, 'fast');
      window.scrollTo(0, 0);
      this.loading = false;
    }
    else {
      this.pageGetparameters.pageid = null;
      this.loading = false;
    }
  }

  previous() {
    this.loading = true;
    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];
    this.currentPageContent = {};
    this.tagline = "";
    if (this.counter > 1) {
      this.counter--;
      this.pageGetparameters.pageid = this.counter;
      let Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
      this.location.go(Url);
      this.commonService.setCurrentUrl(Url);
      this.LoadPage(this.counter);
      window.scrollTo(0, 0);
      this.loading = false;
    }
    else {
      this.pageGetparameters.pageid = null;
      this.counter = 0;
      let Url = this.router.createUrlTree(['/home', this.BookID, this.lang]).toString();
      this.location.go(Url);
      this.commonService.setCurrentUrl(Url);
      this.LoadPage(this.counter);
      window.scrollTo(0, 0);
      this.loading = false;
    }
  }

  selectedPage(pageid) {
    this.loading = true;
    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];
    this.tagline = "";

    if (this.counter < this.allPages.length) {
      this.counter++;
      this.LoadPage(pageid);
      this.loading = false;
    }
  }

  isArray(item) {

    var retValue = true;
    if (item == undefined) retValue = false;
    if (typeof item == 'string') retValue = false;
    return retValue;

  }

  ClearContent() {
    this.tagline = "";
    this.summary_line = "";
    this.Cards = [];
    this.cardsContent = [];
    this.currentPageContent = {};
    this.multiple_summary_line = [];
    this.paras = [];
    this.call_to_action = '';

  }

  LoadPage(pageid) {
    this.loading = true;
    this.ClearContent();

    //get page name from id
    //What if pageid donot exist
    let page_name = this.pageNames[pageid];

    let selected_page = this.allPages.filter(row => {
      // if (row.pagename == page_name){
      //   return true;
      // }
      // else{
      //   this.loading = false;
      // return false;
      // }
      return row.pagename == page_name;

    });

    if (selected_page.length == 0) {
      if (this.currentPageContent == undefined) {
        console.log('Page not found in page collection : ' + pageid)
        return;
      }
      this.loading = false;
    }

    this.currentPageContent = selected_page[0];//this.allPages[pageid];
    if (this.currentPageContent && this.currentPageContent.header) {
      this.currentPageContent.heading = this.currentPageContent.header.title['content:text'];
      this.loading = false;
    }
    else if (this.currentPageContent && this.currentPageContent.heading) {
      this.currentPageContent.heading = this.currentPageContent.heading;
      this.loading = false;
    }
    else {
      console.log('Page not found to load : ' + pageid)
      this.loading = false;
    }

    if (this.currentPageContent == undefined) {
      console.log('Page not header found to load : ' + pageid)
      // this.showNoRecordFound= true;
      this.loading = false;
      return;

    }

    if (this.currentPageContent.paragraph["content:paragraph"] != undefined) {
      this.summary_line = this.currentPageContent.paragraph["content:paragraph"]["content:text"];
      if (typeof this.summary_line != "string") {
        this.multiple_summary_line = this.summary_line;
        this.summary_line = '';
      }
      this.loading = false;
    } else this.summary_line = '';
    this.call_to_action = this.currentPageContent.call_to_action;
    this.paras = this.currentPageContent.paras;

    if (this.currentPageContent.cards.length > 0) {
      let Url = "";
      if (this.counter > 0) {
        Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
      }
      else {
        Url = this.router.createUrlTree(['/home', this.BookID, this.lang]).toString();
      }

      this.location.go(Url);
      this.Cards = this.currentPageContent.cards;
      for (let i = 0; i < this.Cards.length; i++) {
        if (this.Cards[i].localImage == undefined) this.Cards[i].localImage = [];
        for (let j = 0; j < this.Cards[i].image.length; j++) {
          if (this.Cards[i].image[j] == "") {
            this.Cards[i].localImage[j] = "";
          }
          else {
            this.Cards[i].localImage[j] = this.sanitizer.bypassSecurityTrustUrl(localStorage.getItem(this.Cards[i].image[j]));
          }
        }

        for (let j = 0; j < this.Cards[i].tabs.length; j++) {
          for (let k = 0; k < this.Cards[i].tabs[j].images.length; k++) {
            if (this.Cards[i].tabs[j].images[k] == "") {
              this.Cards[i].tabs[j].localImage[k] = "";
            }
            else {
              this.Cards[i].tabs[j].localImage[k] = this.sanitizer.bypassSecurityTrustUrl(localStorage.getItem(this.Cards[i].tabs[j].images[k]));
            }

          }

        }

      }
      this.loading = false;
    }

  }

}
