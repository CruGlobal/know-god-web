import { Component, OnInit, HostListener } from '@angular/core';
import { CommonService } from '../services/common.service';
import { APIURL } from '../api/url';
import { TextDecoder } from '../../../node_modules/text-encoding/index.js';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
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
  //languageSelected: any;
  bookname: any;
  //allResourcesImages: any;
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
  //jsonXmlFiles = [];
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
  FirstPage = false;
  LastPage = false;
  headerCounter;

  private sub: any;
  constructor(public commonService: CommonService,
    private ngxXml2jsonService: NgxXml2jsonService,
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    public router: Router,
    public location: Location,
    private loaderService: LoaderService
  ) {

    this.showLoader = true;
    this.AllBooks();
    this.AllLanguages();
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
    this.loaderService.status.subscribe((val: boolean) => {
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

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    let RIGHT_ARROW = 39;
    let LEFT_ARROW = 37;

    if (event.keyCode === RIGHT_ARROW && this.counter<this.allPages.length-1) {
      this.next();
    }

    if (event.keyCode === LEFT_ARROW && this.counter>0) {
      this.previous();
    }
  }

  /*To get all books*/
  AllBooks() {
    //this.loading = true;
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
        //this.loading = false;
      })
  }

  /*To get all languages*/
  AllLanguages() {
    //this.loading = true;
    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES)
      .subscribe((data: any) => {
        this.allLanguages = data.data;
        // this.selectedBookLanguauageTranslations = [];
        //this.loading = false;
      })
  }

  AllLanguages_old() {
    //this.loading = true;
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
        //this.loading = false;
      })
  }

  /*Language translations for selected book*/
  LanguagesForSelectedBook() {
    //this.loading = true;
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

    this.allLanguagesTranslations = this.allLanguages;
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
      if (language != undefined) {
        this.selectedBookLanguauageTranslations.push(language);
      }
    }

    this.showNoRecordFound = this.checkIfPreSelectedLanguageExists();
    //this.loading = false;
  }

  // LanguagesForSelectedBook_old() {
  //   //this.loading = true;
  //   this.showNoRecordFound = false;
  //   this.errorpresent = false;
  //   this.errorMsg = '';
  //   this.selectedBookLanguauageTranslations = [];
  //   this.selectLan = '';
  //   this.tagline = "";
  //   this.summary_line = "";
  //   this.Cards = [];
  //   this.cardsContent = [];
  //   this.currentPageContent = {};
  //   this.multiple_summary_line = [];
  //   //  this.pageGetparameters.pageid = 0;
  //   //this.counter = 0;
  //   this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES)
  //     .subscribe((data: any) => {
  //       this.allLanguagesTranslations = data.data;
  //       for (let i = 0; i < this.allLanguagesTranslations.length; i++) {
  //         let language;
  //         let currentIterationTranslations = this.allLanguagesTranslations[i].relationships.translations.data;
  //         for (let j = 0; j < currentIterationTranslations.length; j++) {
  //           for (let k = 0; k < this.currentBookTranslations.length; k++) {
  //             if (this.currentBookTranslations[k].id == currentIterationTranslations[j].id) {
  //               language = this.allLanguagesTranslations[i];
  //             }
  //           }
  //         }
  //         if (language == undefined) {

  //         }
  //         else {
  //           this.selectedBookLanguauageTranslations.push(language);
  //         }
  //       }

  //       this.showNoRecordFound = this.checkIfPreSelectedLanguageExists();
  //       //this.loading = false;
  //     })
  // }

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
      this.setPrevURL();
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
        this.currentLanguageTransalations = data.data.relationships.translations.data; //this.IndexContent.data.relationships["latest-translations"].data;
        this.translationsMapper(this.currentBookTranslations, this.currentLanguageTransalations);

        if (this.currentTranslations.length == 0) {
          this.errorpresent = true;
          this.errorMsg = "This book is not available in selected language.";
          this.loaderService.display(false);
          //this.loading = false;
          return;
        } else this.errorpresent = false;

        if (this.pageGetparameters.pageid) {
          this.getXmlFiles(this.currentTranslations[this.pageGetparameters.pageid]);
          this.setPrevURL();
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
      })
    //this.loading = false;

  }

  // selectLanguage_old(lang, selectChoice = false) {
  //   this.loaderService.display(true);
  //   //this.loading = true;
  //   this.showNoRecordFound = false;
  //   this.errorpresent = false;
  //   this.errorMsg = '';
  //   this.IndexContent = null;
  //   this.ClearContent();
  //   this.lang = lang.attributes.code;
  //   this.pageGetparameters.langid = lang.attributes.code;
  //   this.pageGetparameters.dir = lang.attributes.direction;
  //   if (!this.pageGetparameters.pageid) {
  //     let Url = this.router.createUrlTree(['/home', this.BookID, lang.attributes.code]).toString();
  //     this.location.go(Url);
  //     this.commonService.setCurrentUrl(Url);
  //   }
  //   this.language = false;
  //   this.selectLan = lang.attributes.name;
  //   this.commonService.selectedLan = lang;
  //   this.selectedLanguageId = lang.id

  //   this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES + lang.id)
  //     .subscribe((data: any) => {

  //       this.getIndex();

  //       this.currentLanguageTransalations = data.data.relationships.translations.data;
  //       this.translationsMapper(this.currentBookTranslations, this.currentLanguageTransalations);

  //       if (this.currentTranslations.length == 0) {
  //         this.errorpresent = true;
  //         this.errorMsg = "This book is not available in selected language.";
  //         this.loaderService.display(false);
  //         //this.loading = false;
  //         return;
  //       }

  //       if (this.pageGetparameters.pageid) {
  //         this.getXmlFiles(this.currentTranslations[this.pageGetparameters.pageid]);
  //         let Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
  //         this.location.go(Url);
  //         this.commonService.setCurrentUrl(Url);
  //         this.getXmlFiles(this.currentTranslations[0]);

  //       }
  //       else {
  //         this.getXmlFiles(this.currentTranslations[0]);
  //         //this.LanguagesForSelectedBook();
  //         //this.AllLanguages()
  //       }
  //       //this.loading = false;
  //     })

  //   // this.currentPage();
  // }

  BookID = "";

  // getCurrentUrl() {
  //   let Url = this.router.url;
  //   this.commonService.setCurrentUrl(Url);
  //   console.log(this.router.url);
  // }
  selectBook(book, fromChoice = false) {
    this.loaderService.display(true);
    //this.loading = true;
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
    }

    this.books = false;
    this.selectbook = book.attributes.name;
    this.selectedBookId = book.id;

    this.getIndex();

    //this.loading = false;
  }

  // selectBook_old(book, fromChoice = false) {
  //   this.loaderService.display(true);
  //   //this.loading = true;
  //   this.BookID = book.attributes.abbreviation
  //   this.selectLan = '';
  //   this.selectedBookLanguauageTranslations = [];

  //   if (fromChoice == true) {
  //     this.pageGetparameters.pageid = 0;
  //     this.counter = 0;
  //   }
  //   this.pageNames = [];
  //   this.ClearContent();

  //   if (!this.pageGetparameters.langid) {
  //     let Url = this.router.navigateByUrl('/home/' + book.attributes.abbreviation)
  //     this.commonService.setCurrentUrl(Url);
  //   }

  //   this.books = false;
  //   this.selectbook = book.attributes.name;
  //   this.selectedBookId = book.id;

  //   this.commonService.getBooks(APIURL.GET_ALL_BOOKS + book.id + "?include=translations")
  //     .subscribe((data: any) => {
  //       // this.counter=0;
  //       if (data.data["attributes"]["resource-type"] == "tract") {
  //         this.currentBookTranslations = data.included;
  //         this.LanguagesForSelectedBook();
  //       }
  //       this.AllLanguages();
  //       //this.loading = false;
  //     })

  //   //this.loading = false;
  // }

  translationsMapper(booktranslations, languagetranslations) {
    //this.loading = true;
    this.currentTranslations = [];
    for (let j = 0; j < languagetranslations.length; j++) {
      for (let i = 0; i < booktranslations.length; i++) {
        if (this.currentBookTranslations[i].id == this.currentLanguageTransalations[j].id) {
          this.currentTranslations.push(this.currentBookTranslations[i])
          //this.loading = false;
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
    //this.loading = true;
    if (id == undefined) return;
    let manifest_name = id.attributes["manifest-name"];
    if (manifest_name == null) {
      console.log('Manifest name not specified in index file')
      this.ClearContent();
      this.errorpresent = true;
      this.errorMsg = "Problem loading book content.";
      this.loaderService.display(false);
      //this.loading = false;
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
            this.errorpresent = true;
            this.errorMsg = "Problem loading book content.";
            //return;
          }
          //new code change.

          if (jsondata["manifest"]["pages"]["page"] && jsondata["manifest"]["pages"]["page"].length != undefined && jsondata["manifest"]["pages"]["page"].length > 0) {

            this.pageCount = jsondata["manifest"]["pages"]["page"].length;

            for (let j = 0; j < jsondata["manifest"]["pages"]["page"].length; j++) {
              this.page.filename = jsondata["manifest"]["pages"]["page"][j]["@attributes"]["filename"];
              this.page.src = jsondata["manifest"]["pages"]["page"][j]["@attributes"]["src"];
              this.page.translationId = translationId;
              this.pages.push(this.page);
              this.AllPagesContent = [];
              this.allPages = [];
              //this.allResourcesImages = [];
              this.getXmlFileForEachPage(this.page);
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
              //this.getXmlFileForEachResource(this.resource);
              //this.getImages1(this.resource);
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
            this.errorpresent = true;
            this.errorMsg = "Problem loading book content.";
          });
      //this.loading = false;
      //  this.loaderService.display(false);
    }
  }


  getXmlFileForEachPage(page) {
    //this.loading = true;
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

        if (this.pageCount == this.AllPagesContent.length) {
          this.currentPage();
          this.loaderService.display(false);
        }
        //setTimeout(() => { this.currentPage();  }, 1000);
        // window.localStorage["JSONdata"] = jsondata;
        // var accessdata = window.localStorage["JSONdata"];
        // console.log("ACCESSDATA:", accessdata);
        //this.loading = false;
      });
  }

  imageUrl
  /*To get images from xml files*/
  // getXmlFileForEachResource(resource) {
  //   //this.loading = true;
  //   this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + resource.translationId + "/" + resource.src)
  //     .subscribe((data: any) => {
  //       var data = data;
  //       var file = new Blob([data], {
  //         type: 'image/jpeg, image/png, image/gif'
  //       });

  //       // if(this.pageCount == 0)
  //       // setTimeout(() => { this.currentPage(); this.loaderService.display(false); }, 1000);

  //       var fileURL = URL.createObjectURL(file);
  //       this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(fileURL);
  //       localStorage.setItem(resource.filename, fileURL);
  //       var imageUrls = { filename: resource.filename, imageUrl: this.imageUrl }
  //       this.allResourcesImages.push(imageUrls);
  //       //this.loading = false;
  //     })
  // }

  // getImages1(resource) {
  //   //this.loading = true;
  //   //this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST+"1061/fedd51055ce5ca6351d19f781601eb94192915597b4b023172acaab4fac04794")
  //   this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + resource.translationId + "/" + resource.src)
  //     .subscribe((x: any) => {
  //       const reader = new FileReader();

  //       if (x instanceof Blob) reader.readAsDataURL(x);
  //       reader.onloadend = function () {
  //         //localStorage.set('abc.jpg',reader.result);
  //         localStorage.set(resource.filename, reader.result);
  //       };
  //       //this.loading = false;
  //     })
  // }

  getIndex() {
    //this.loading = true;
    //this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST+"1061/fedd51055ce5ca6351d19f781601eb94192915597b4b023172acaab4fac04794")
    this.commonService.downloadFile(APIURL.GET_INDEX_FILE.replace('{0}', this.selectedBookId))
      .subscribe((data: any) => {

        /*Convertion of array buffer to xml*/
        let enc = new TextDecoder("utf-8");
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);

        /*convertion of xml to json*/
        let jsondata = JSON.parse(result);
        this.IndexContent = jsondata;

        if (this.IndexContent.data["attributes"]["resource-type"] == "tract") {

          this.currentBookTranslations = [];
          this.IndexContent.data.relationships["latest-translations"].data.forEach(translation => {

            var required = this.IndexContent.included.filter(row => {
              if (row.type == "translation" && row.id == translation.id)
                return true;
              else
                return false;
            });

            required.forEach(element => {
              this.currentBookTranslations.push(element);
            });

          });
          //this.currentBookTranslations = this.IndexContent.included;
          this.LanguagesForSelectedBook();
        }

        this.selectLanguage('', false);

        //this.loading = false;
      })
  }

  getImages(resource) {

    if (resource == undefined || resource == '' || resource == null) return '';

    if (this.IndexContent != undefined && this.IndexContent != null) {

      var attachments = this.IndexContent.included.filter(row => {
        if (row.type.toLowerCase() == "attachment" && row.attributes["file-file-name"].toLowerCase() == resource.toLowerCase())
          return true;
        else
          return false;
      });

      if (attachments.length == 0) {
        console.log('getImages: Image not found in index file')
        return '';
      }

      var filename = attachments[0].attributes.file

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
    this.books = false
  }
  Books() {
    this.language = false;
    this.books = !this.books;

  }

  allPages = [];
  getImageName(contentImage) {

    var ImageName = '';
    var ImagePath = '';
    if (contentImage["@attributes"]["restrictTo"] == undefined ||
      contentImage["@attributes"]["restrictTo"] == null ||
      contentImage["@attributes"]["restrictTo"] == "web") {
      ImageName = contentImage["@attributes"]["resource"];
      ImagePath = this.getImages(ImageName);
      return ImagePath
    }
    else return '';
  }

  objectMapper(resourcePage, pagename) {
    let heading, card, cards, paragraph, call_to_action, obj, attributes, paras, modals;
    obj = {};
    heading = {};
    paragraph = {};
    call_to_action = {};
    cards = [];
    modals = [];

    attributes = {};
    if (resourcePage.page.hero) {
      heading = resourcePage.page.hero.heading == undefined ? '' : resourcePage.page.hero.heading["content:text"];
      //paragraph = resourcePage.page.hero;
      obj = resourcePage.page;

      paras = this.getHeroContent(resourcePage.page.hero);

    }
    if (resourcePage.page.header) {
      heading = resourcePage.page.header.title["content:text"];
      obj = resourcePage.page;
      paragraph = '';
      if (resourcePage.page.cards != undefined) {
        for (let i = 0; i < resourcePage.page.cards.card.length; i++) {
          let card = this.getCardContent(resourcePage, i);
          cards.push(card);
        }
      }
    }

    if (resourcePage.page.cards) {

      obj = resourcePage.page;

      if (cards.length == 0) { //dont process card, if already done in header
        for (let i = 0; i < resourcePage.page.cards.card.length; i++) {
          let card = this.getCardContent(resourcePage, i);
          cards.push(card);
        }
      }
    }

    if (resourcePage.page.modals) {

      if (resourcePage.page.modals.modal.length == undefined) {
        let modal = this.getModalContent(resourcePage, null);
        modals.push(modal);
      }
      else {
        for (let i = 0; i < resourcePage.page.modals.modal.length; i++) {
          let modal = this.getModalContent(resourcePage, i);
          modals.push(modal);
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
    obj.modals = modals;
    obj.pagename = pagename;
    this.allPages.push(obj);

  }

  getHeroContent(hero) {
    var heropara = [];
    let heroparagraphs = [];

    if (hero["content:paragraph"] != undefined && hero["content:paragraph"].length != undefined) {
      heroparagraphs = hero["content:paragraph"];
    } else if (hero["content:paragraph"] != undefined && hero["content:paragraph"].length == undefined) {
      heroparagraphs.push(hero["content:paragraph"]);
    }

    heroparagraphs.forEach(para => {
      if (para["content:text"] != undefined) {
        var paracontent = { type: '', text: '', image: '' };
        paracontent.type = "text";
        paracontent.text = para["content:text"];
        heropara.push(paracontent);
      }
      if (para["content:button"] != undefined) {
        var paracontent = { type: '', text: '', image: '' };
        paracontent.type = "button";
        paracontent.text = para["content:button"]["content:text"];
        heropara.push(paracontent);
      }
      if (para["content:image"] != undefined) {
        if (para["content:image"].length == undefined) {
          var paracontent = { type: '', text: '', image: '' };
          paracontent.type = "image";
          paracontent.image = this.getImageName(para["content:image"]); //para["content:image"]["@attributes"]["resource"];
          heropara.push(paracontent);
        } else {
          para["content:image"].forEach(heroimage => {
            var paracontent = { type: '', text: '', image: '' };
            paracontent.type = "image";
            paracontent.image = this.getImageName(heroimage); //para["content:image"]["@attributes"]["resource"];
            heropara.push(paracontent);
          });
        }
      }

    });

    return heropara;

  }

  getCardContent(resourcePage, i) {

    let card = {
      label: "",
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
      isForm: false
    };

    if (resourcePage.page.cards.card[i]["@attributes"]) {
      if (resourcePage.page.cards.card[i]["@attributes"].hidden) card.hidden = resourcePage.page.cards.card[i]["@attributes"].hidden;
      if (resourcePage.page.cards.card[i]["@attributes"]["listeners"]) card.listener = resourcePage.page.cards.card[i]["@attributes"]["listeners"];
      if (resourcePage.page.cards.card[i]["@attributes"]["dismiss-listeners"]) card.dismiss = resourcePage.page.cards.card[i]["@attributes"]["dismiss-listeners"];

      if (card.listener != '' && card.dismiss != '') card.isForm = true;
    }

    //handle card heading
    card.label = resourcePage.page.cards.card[i].label["content:text"];

    //handle card paragraph
    let paragraphs = [];
    if (resourcePage.page.cards.card[i]["content:paragraph"]) {
      if (resourcePage.page.cards.card[i]["content:paragraph"].length == undefined) {
        paragraphs.push(resourcePage.page.cards.card[i]["content:paragraph"]);
      } else
        paragraphs = resourcePage.page.cards.card[i]["content:paragraph"];
    }

    for (let j = 0; j < paragraphs.length; j++) {
      var formpara = paragraphs[j];
      card.content.push(formpara["content:text"]);

      //handle buttons
      if (formpara["content:button"]) {
        card.button.push([formpara["content:button"]["content:text"], (formpara["content:button"]["@attributes"] == undefined) ? '' : formpara["content:button"]["@attributes"].events]);
      } else card.button.push('');

      //handle links
      if (formpara["content:link"]) {
        card.link.push([formpara["content:link"]["content:text"], formpara["content:link"]["@attributes"].events]);
      } else card.link.push('');


      //handle image
      if (formpara["content:image"]) {

        if (formpara["content:image"].length == undefined)
          card.image.push(this.getImageName(formpara["content:image"])); //(formpara["content:image"]["@attributes"]["resource"]);
        else {
          var imgArr = [];
          formpara["content:image"].forEach(cardimage => {
            var paracontent = { type: '', text: '', image: '' };
            paracontent.type = "image";
            paracontent.image = this.getImageName(cardimage); //para["content:image"]["@attributes"]["resource"];
            imgArr.push(paracontent);
          });
          card.image.push(imgArr);
        }
      }
      else {
        card.image.push("");
      }

      //handle content tabs
      if (formpara["content:tabs"]) {
        let tab;
        for (let k = 0; k < formpara["content:tabs"]["content:tab"].length; k++) {
          tab = formpara["content:tabs"]["content:tab"][k];
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
          if (tab["content:image"].length == undefined) eachtab.images.push(this.getImageName(tab["content:image"])); //(tab["content:image"]["@attributes"]["resource"])
          else {
            tab["content:image"].forEach(tabimage => {
              eachtab.images.push(this.getImageName(tabimage))
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
    //let htmlelement = {};
    let cardforms = {
      elements: [],
      buttons: [],
      links: [],
    }
    let forms = resourcePage.page.cards.card[i]["content:form"];
    if (forms != undefined) {

      //handle input elements
      let elements = forms["content:input"];
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

          if (formelement["@attributes"].name) htmlelement.name = formelement["@attributes"].name;
          if (formelement["@attributes"].type) htmlelement.type = formelement["@attributes"].type;
          if (formelement["@attributes"].value) htmlelement.value = formelement["@attributes"].value;
          if (formelement["@attributes"].required) htmlelement.required = formelement["@attributes"].required;
          if (formelement["content:label"]) htmlelement.label = formelement["content:label"]["content:text"];
          if (formelement["content:placeholder"]) htmlelement.placeholder = formelement["content:placeholder"]["content:text"];

          cardforms.elements.push(htmlelement)

        }
      }


      //handle form paragraph
      let paragraphs = [];
      if (forms["content:paragraph"] != undefined) {
        if (forms["content:paragraph"].length == undefined) {
          paragraphs.push(forms["content:paragraph"]);
        } else
          paragraphs = forms["content:paragraph"];
      }

      //handle form buttons and links
      for (let j = 0; j < paragraphs.length; j++) {
        var formpara = paragraphs[j];
        if (formpara["content:button"]) {
          cardforms.buttons.push([formpara["content:button"]["content:text"], formpara["content:button"]["@attributes"].events]);
        } else if (formpara["content:link"]) {
          cardforms.links.push([formpara["content:link"]["content:text"], formpara["content:link"]["@attributes"].events]);
        }
      }


      card.forms.push(cardforms);

    }
    return card;
  }

  getModalContent(resourcePage, i) {

    let modal = {
      title: "",
      paras: [{
        text: '',
        button: [],
        type: ''
      }],
      listener: '',
      dismiss: '',
    };

    let currentModal = (i == null) ? resourcePage.page.modals.modal : resourcePage.page.modals.modal[i];

    if (currentModal["@attributes"]) {
      if (currentModal["@attributes"]["listeners"]) modal.listener = currentModal["@attributes"]["listeners"];
      if (currentModal["@attributes"]["dismiss-listeners"]) modal.dismiss = currentModal["@attributes"]["dismiss-listeners"];

    }

    //handle modal heading
    modal.title = currentModal.title["content:text"];

    //handle card paragraph
    let paragraphs = [];
    if (currentModal["content:paragraph"]) {
      if (currentModal["content:paragraph"].length == undefined) {
        paragraphs.push(currentModal["content:paragraph"]);
      } else
        paragraphs = currentModal["content:paragraph"];
    }

    for (let j = 0; j < paragraphs.length; j++) {
      var modalpara = paragraphs[j];

      if (modalpara["content:text"]) {
        modal.paras.push({ text: modalpara["content:text"], button: [], type: 'text' });
      }

      //handle buttons
      if (modalpara["content:button"]) {
        modal.paras.push({ text: '', type: 'button', button: [modalpara["content:button"]["content:text"], modalpara["content:button"]["@attributes"].events] });

      }
    }
    return modal;
  }


  setPrevURL() {
    (<HTMLInputElement>document.getElementById("prevURL")).value = location.href;
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
    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];
    this.tagline = "";
    this.currentPageContent = {};
    this.LoadPage(this.counter);

  }

  next() {
    //this.loading = true;
    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];

    if (this.counter < this.allPages.length - 1) {
      this.counter++;
      this.pageGetparameters.pageid = this.counter;
      this.setPrevURL();
      let Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
      this.location.go(Url);
      this.commonService.setCurrentUrl(Url);
      this.LoadPage(this.counter);
      //$('html, body').animate({ scrollTop: 0 }, 'fast');
      window.scrollTo(0, 0);
      //this.loading = false;
    }
    else {
      this.pageGetparameters.pageid = null;
      //this.loading = false;
    }
  }

  previous() {
    //this.loading = true;
    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];
    this.currentPageContent = {};
    this.tagline = "";
    if (this.counter > 1) {
      this.counter--;
      this.pageGetparameters.pageid = this.counter;
      this.setPrevURL();
      let Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
      this.location.go(Url);
      this.commonService.setCurrentUrl(Url);
      this.LoadPage(this.counter);
      window.scrollTo(0, 0);
      //this.loading = false;
    }
    else {
      this.pageGetparameters.pageid = null;
      this.counter = 0;
      this.setPrevURL();
      let Url = this.router.createUrlTree(['/home', this.BookID, this.lang]).toString();
      this.location.go(Url);
      this.commonService.setCurrentUrl(Url);
      this.LoadPage(this.counter);
      window.scrollTo(0, 0);
      //this.loading = false;
    }
  }

  selectedPage(pageid) {
    //this.loading = true;
    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];
    this.tagline = "";

    if (this.counter < this.allPages.length) {
      this.counter++;
      this.LoadPage(pageid);
      //this.loading = false;
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
    this.FirstPage = false;
    this.LastPage = false;
  }

  LoadPage(pageid) {
    //this.loading = true;
    this.displayForm = false;
    this.displayModel = false;

    this.ClearContent();

    //get page name from id
    //What if pageid donot exist
    let page_name = this.pageNames[pageid];

    if (this.counter == 0) this.FirstPage = true;
    else this.FirstPage = false;

    if (this.counter == this.allPages.length - 1)
      this.LastPage = true;
    else
      this.LastPage = false;

    let selected_page = this.allPages.filter(row => {
      return row.pagename == page_name;
    });

    if (selected_page.length == 0) {
      if (this.currentPageContent == undefined) {
        // console.log('Page not found in page collection : ' + pageid)
        return;
      }
      //this.loading = false;
    }

    this.currentPageContent = selected_page[0];//this.allPages[pageid];
    if (this.currentPageContent && this.currentPageContent.header) {
      this.currentPageContent.heading = this.currentPageContent.header.title['content:text'];
      //this.loading = false;
    }
    else if (this.currentPageContent && this.currentPageContent.heading) {
      this.currentPageContent.heading = this.currentPageContent.heading;
      //this.loading = false;
    }
    else {
      //   console.log('Page not found to load : ' + pageid)
      //this.loading = false;
    }

    if (this.currentPageContent == undefined) {
      console.log('Page not header found to load : ' + pageid)
      // this.showNoRecordFound= true;
      //this.loading = false;
      return;

    }

    if (this.currentPageContent.paragraph["content:paragraph"] != undefined) {
      this.summary_line = this.currentPageContent.paragraph["content:paragraph"]["content:text"];
      if (typeof this.summary_line != "string") {
        this.multiple_summary_line = this.summary_line;
        this.summary_line = '';
      }
      //this.loading = false;
    } else this.summary_line = '';
    this.call_to_action = this.currentPageContent.call_to_action;
    this.paras = this.currentPageContent.paras;

    if (this.currentPageContent.cards.length > 0) {
      let Url = "";
      // this.setPrevURL();
      if (this.counter > 0) {
        Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
      }
      else {
        Url = this.router.createUrlTree(['/home', this.BookID, this.lang]).toString();
      }


      this.location.go(Url);
      this.Modals = this.currentPageContent.modals;
      this.Cards = this.currentPageContent.cards;
      for (let i = 0; i < this.Cards.length; i++) {

        if ((this.Cards[i].listener == '' && this.Cards[i].dismiss == '') || this.Cards[i].forms.length == 0)
          this.Cards[i].hidden = false;
        else
          this.Cards[i].hidden = true;

        // if (this.Cards[i].localImage == undefined) this.Cards[i].localImage = [];
        // for (let j = 0; j < this.Cards[i].image.length; j++) {
        //   if (this.Cards[i].image[j] == "") {
        //     this.Cards[i].localImage[j] = "";
        //   }
        //   else {
        //     this.Cards[i].localImage[j] = this.Cards[i].image[j];// this.sanitizer.bypassSecurityTrustUrl(localStorage.getItem(this.Cards[i].image[j]));
        //   }
        // }

        // for (let j = 0; j < this.Cards[i].tabs.length; j++) {
        //   for (let k = 0; k < this.Cards[i].tabs[j].images.length; k++) {
        //     if (this.Cards[i].tabs[j].images[k] == "") {
        //       this.Cards[i].tabs[j].localImage[k] = "";
        //     }
        //     else {
        //       this.Cards[i].tabs[j].localImage[k] = this.Cards[i].tabs[j].images[k];//this.sanitizer.bypassSecurityTrustUrl(localStorage.getItem(this.Cards[i].tabs[j].images[k]));
        //     }
        //   }
        // }

      }
      //this.loading = false;
    }

    if (this.currentPageContent.header != null &&  this.currentPageContent.header.number != null) {
      this.headerCounter =  this.currentPageContent.header.number['content:text'];
    } else {
      this.headerCounter = null;
    }

    this.showLoader = false;
  }

  // getCards(isForm) {

  //   let cardItems = this.Cards.filter(row => {
  //     return row.isForm == isForm;
  //   });
  //   return cardItems;

  // }

  formAction(inputFunctionName) {

    let functionName = inputFunctionName;

    if (functionName.indexOf(' ') > -1) {
      var splitname = functionName.split(' ');

      if (splitname[0].indexOf(":") > -1) functionName = splitname[1].trim();
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
      this.tagline = "";
      this.summary_line = "";
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
    if (!link.startsWith("http://") || !link.startsWith("https://")) {
      link = `http://${link}`;
    }
    parser.href = link;
    let hostnameFromLink = parser.hostname;
    return hostnameFromLink
  }

}
