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

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit {
  bookid: any;

  myUrl: string;
  languageSelected: any;
  bookname: any;
  allResourcesImages: any;
  selectedBookLanguauageTranslations = [];
  allLanguagesTranslations: any;
  currentPageContent: any;
  language: boolean = false;
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
    public router: Router, public location: Location) {


  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  pageGetparameters = {
    bookid: null,
    langid: null,
    pageid: null,
    dir:'rtl'



  }

  ngOnInit() {


    //
    this.AllBooks();
    // this.AllLanguages();
    this.sub = this.route.params.subscribe(params => {
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

							 
														 
      }

      else if (params['bookid'] && params['langid']) {
        this.pageGetparameters.bookid = params['bookid']
        this.pageGetparameters.langid = params['langid']
      }
																   
														
														
															  
											 

      else if (params['bookid']) {
        this.pageGetparameters.bookid = params['bookid'];
      }

						   
							 
								 
		  
    })
  }

  /*To get all books*/
  AllBooks() {
    this.commonService.getBooks(APIURL.GET_ALL_BOOKS)
      .subscribe((data: any) => {
        this.allBooks = data.data;

        if (this.pageGetparameters.bookid) {
          this.allBooks.forEach(x => {

            if (x.attributes.abbreviation == this.pageGetparameters.bookid) {
              this.selectBook(x)
            }

          });
        }
        console.log("AllBooks:", this, this.allBooks)

      })
  }

  /*To get all languages*/
  AllLanguages() {



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
        console.log("Languages:", this.allLanguages)

      })
  }

  /*Language translations for selected book*/
  LanguagesForSelectedBook() {
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
        console.log("selectedBookLanguageTranslations:", this.selectedBookLanguauageTranslations);
      })
  }
  lang = "";
  selectLanguage(lang) {
    this.lang = lang.attributes.code;
    this.pageGetparameters.langid = lang.attributes.code;
		this.pageGetparameters.dir = lang.attributes.direction;												   
    console.log(lang);
    if (!this.pageGetparameters.pageid) {
      let Url = this.router.createUrlTree(['/home', this.BookID, lang.attributes.code]).toString();
      this.location.go(Url);
    }

    this.language = false;
    this.selectLan = lang.attributes.name
    this.selectedLanguageId = lang.id
    console.log("Selected Language Id:", this.selectedLanguageId)
    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES + lang.id)
      .subscribe((data: any) => {
        this.currentLanguageTransalations = data.data.relationships.translations.data;
        //console.log("currentLanguageTranslations:", this.currentLanguageTransalations)
        this.translationsMapper(this.currentBookTranslations, this.currentLanguageTransalations);
        console.log("currentTranslations:", this.currentTranslations);
        // for (let i = 0; i < this.currentTranslations.length; i++) {
        //   this.getXmlFiles(this.currentTranslations[i]);
        // }

        if (this.pageGetparameters.pageid) {
          this.getXmlFiles(this.currentTranslations[this.pageGetparameters.pageid]);
        }
        else {
          this.getXmlFiles(this.currentTranslations[0]);
          //this.LanguagesForSelectedBook();
          //this.AllLanguages()
        }        
      })
	 this.currentPage();					 
  }
  BookID = "";

  getCurrentUrl(){
      console.log(this.router.url);
  }
  selectBook(book) {
    console.log(book);
    this.BookID = book.attributes.abbreviation

    if (!this.pageGetparameters.langid) {
		 let Url=this.router.navigateByUrl('/home/'+ book.attributes.abbreviation)
     // le																	   
      //let Url = this.router.createUrlTree(['/home', book.attributes.abbreviation]).toString();
      //this.location.go(Url);
    }


    this.books = false;
    this.selectbook = book.attributes.name;
    this.selectedBookId = book.id;
    console.log("Selected Book Id:", this.selectedBookId);
    this.commonService.getBooks(APIURL.GET_ALL_BOOKS + book.id + "?include=translations")
      .subscribe((data: any) => {
        console.log(data);
        if (data.data["attributes"]["resource-type"] == "tract") {
          this.currentBookTranslations = data.included;
          this.LanguagesForSelectedBook();
        }
	  this.AllLanguages();

      })


  
    //isDefault
    // this.sub = this.route.params.subscribe(params => {
    //   if (params['bookid'] && params['langid'] && params['pageid']) {
    //     this.selectedPage(params['pageid']);
    //   }
    //   else if (params['bookid'] && params['langid']) {
    //     //this.selectLanguage(params['langname'], params['langid']);
    //   }
    //   else if (params['bookid']) {
    //     let bookname = this.route.queryParams['bookname']
    //    // this.selectBook(bookname, params['bookid']);
    //   }
    //   else {
    //     //default flow
    //     // this.AllBooks();
    //     // this.AllLanguages();
    //   }
    // })
}

  translationsMapper(booktranslations, languagetranslations) {
    this.currentTranslations = [];
    for (let j = 0; j < languagetranslations.length; j++) {
      for (let i = 0; i < booktranslations.length; i++) {
        if (this.currentBookTranslations[i].id == this.currentLanguageTransalations[j].id) {
          console.log("currentTranslationIdInMapper", this.currentLanguageTransalations[j].id);
          this.currentTranslations.push(this.currentBookTranslations[i])
        }
      }
    }
  }

  /*To get xml files for each translation Id*/
  getXmlFiles(id) {
    let manifest_name = id.attributes["manifest-name"];
    let translationId = id.id;
    //console.log("translationId:", translationId);
    //console.log("Manifest-name:", manifest_name);
    this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + translationId + "/" + manifest_name)
      .subscribe(data => {
        //console.log("data:", data);

        /*Convertion of array buffer to xml*/
        let enc = new TextDecoder("utf-8");
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);
        //console.log("result:", result);

        /*convertion of xml to json*/
        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'text/xml');
        let jsondata = this.ngxXml2jsonService.xmlToJson(xml);
        //console.log("JSON:", jsondata);


        /* All Pages in xml file */
        for (let j = 0; j < jsondata["manifest"]["pages"]["page"].length; j++) {
          this.page.filename = jsondata["manifest"]["pages"]["page"][j]["@attributes"]["filename"];
          this.page.src = jsondata["manifest"]["pages"]["page"][j]["@attributes"]["src"];
          this.page.translationId = translationId;
          //console.log(this.page);
          this.pages.push(this.page);
          this.AllPagesContent = [];
          this.allPages = [];
          this.allResourcesImages = [];
          this.getXmlFileForEachPage(this.page);
          this.page = { filename: "", src: "", translationId: "" };

        }
        //console.log("Pages:", this.pages);

        /*All resources in xml file*/
        for (let j = 0; j < jsondata["manifest"]["resources"]["resource"].length; j++) {
          this.resource.filename = jsondata["manifest"]["resources"]["resource"][j]["@attributes"]["filename"];
          this.resource.src = jsondata["manifest"]["resources"]["resource"][j]["@attributes"]["src"];
          this.resource.translationId = translationId;
          this.pages.push(this.resource);
          this.resources.push(this.resource);
          this.getXmlFileForEachResource(this.resource);
          //this.getImages(this.resource);
          this.resource = { filename: "", src: "", translationId: "" };
        }
        console.log("Resources:", this.resources);
      });
  }


  getXmlFileForEachPage(page) {
    console.log(page);
    this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + "/" + page.translationId + "/" + page.src)
      .subscribe((data: any) => {
        //console.log(data);

        //Convertion of array buffer to xml
        let enc = new TextDecoder("utf-8");
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);
        // console.log("result:", result);
        let obj = {
          xmlFile: result,
          filename: page.filename,
          translationId: page.translationId,
          src: page.src
        }
        //console.log(obj);

        //convertion of xml to json
        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'application/xml');
        let jsondata = this.ngxXml2jsonService.xmlToJson(xml);
        //console.log("JSON:", jsondata);
        this.AllPagesContent.push(jsondata);
        console.log("AllPages:", this.AllPagesContent)
        this.objectMapper(jsondata);
        // window.localStorage["JSONdata"] = jsondata;
        // var accessdata = window.localStorage["JSONdata"];
        // console.log("ACCESSDATA:", accessdata);

      });
  }

  imageUrl
  /*To get images from xml files*/
  getXmlFileForEachResource(resource) {
    console.log("Resource:", resource);
    this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + "/" + resource.translationId + "/" + resource.src)
      .subscribe((data: any) => {
        console.log("Resources xml data:", data);
        var data = data;
        var file = new Blob([data], {
          type: 'image/jpeg, image/png, image/gif'
        });
        var fileURL = URL.createObjectURL(file);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(fileURL);
        localStorage.setItem(resource.filename, fileURL);
        var imageUrls = { filename: resource.filename, imageUrl: this.imageUrl }
        console.log("URL:", imageUrls);
        this.allResourcesImages.push(imageUrls);
        //this.AllPagesContent.push(fileURL);
        console.log("AllImages:", this.allResourcesImages)
        //window.open(fileURL);

      })
  }

  getImages(resource) {

    //this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST+"1061/fedd51055ce5ca6351d19f781601eb94192915597b4b023172acaab4fac04794")
    this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + "/" + resource.translationId + "/" + resource.src)
      .subscribe((x: any) => {
        console.log(x);
        const reader = new FileReader();
        reader.readAsDataURL(x);
        reader.onloadend = function () {
          console.log(reader.result);
          //localStorage.set('abc.jpg',reader.result);
          localStorage.set(resource.filename, reader.result);
        };
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

  objectMapper(resourcePage) {
    let heading, card, cards, paragraph, call_to_action, obj, attributes, paras;
    obj = {};
    heading = {};
    paragraph = {};
    call_to_action = {};
    card = {
      label: "",
      content: [],
      image: [],
      localImage: []
    };
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
        card.label = resourcePage.page.cards.card[i].label["content:text"];

        if (resourcePage.page.cards.card[i]["content:paragraph"].length == undefined) {
          card.content.push(resourcePage.page.cards.card[i]["content:paragraph"]["content:text"]);
          if (resourcePage.page.cards.card[i]["content:paragraph"]["content:image"]) {
            card.image.push(resourcePage.page.cards.card[i]["content:paragraph"]["content:image"]["@attributes"]["resource"]);
          }
          else {
            card.image.push("");
          }
        }
        else
          for (let j = 0; j < resourcePage.page.cards.card[i]["content:paragraph"].length; j++) {
            var cardpara = resourcePage.page.cards.card[i]["content:paragraph"][j];
            card.content.push(cardpara["content:text"]);
            if (cardpara["content:image"]) {
              card.image.push(cardpara["content:image"]["@attributes"]["resource"]);
            }
            else {
              card.image.push("");
            }
          }

        cards.push(card);
        card = {
          label: "",
          content: [],
          image: []
        };
      }

    }
    if (resourcePage.page.hero && resourcePage.page.cards) {
      heading = resourcePage.page.hero.heading["content:text"];
      paragraph = resourcePage.page.hero;
      obj = resourcePage.page;
      for (let i = 0; i < resourcePage.page.cards.card.length; i++) {
        card.label = resourcePage.page.cards.card[i].label["content:text"];

        if (resourcePage.page.cards.card[i]["content:paragraph"].length == undefined) {
          card.content.push(resourcePage.page.cards.card[i]["content:paragraph"]["content:text"]);
          if (resourcePage.page.cards.card[i]["content:paragraph"]["content:image"]) {
            card.image.push(resourcePage.page.cards.card[i]["content:paragraph"]["content:image"]["@attributes"]["resource"]);
          }
          else {
            card.image.push("");
          }
        }
        else
          for (let j = 0; j < resourcePage.page.cards.card[i]["content:paragraph"].length; j++) {
            var cardpara = resourcePage.page.cards.card[i]["content:paragraph"][j];
            card.content.push(cardpara["content:text"]);
            if (cardpara["content:image"]) {
              card.image.push(cardpara["content:image"]["@attributes"]["resource"]);
            }
            else {
              card.image.push("");
            }
          }
        cards.push(card);
        card = {
          label: "",
          content: [],
          image: []
        };
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
    //obj.call_to_action = action;
    this.allPages.push(obj);
    console.log("allPagesMapperObj:", this.allPages);
    //this.currentPageContent = this.allPages[this.counter];
  if (this.counter) {
      this.currentPage();
    }
    else if (this.counter == 0) {
      this.currentPage();
    }


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
    this.currentPageContent = this.allPages[this.counter];

    if (this.currentPageContent.paragraph["content:paragraph"] != undefined) {
      this.summary_line = this.currentPageContent.paragraph["content:paragraph"]["content:text"];
      if (typeof this.summary_line != "string") {
        this.multiple_summary_line = this.summary_line;
        this.summary_line = '';
      }
    } else this.summary_line = '';
    this.call_to_action = this.currentPageContent.call_to_action;
    this.paras = this.currentPageContent.paras;

    if (this.currentPageContent.cards.length > 0) {
			 let Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
      this.location.go(Url);																						  
      this.Cards = this.currentPageContent.cards;
      for (let i = 0; i < this.Cards.length; i++) {

      }

    }


    // }
    console.log("current page cards content:", this.Cards);
    console.log("tagline", this.tagline);

  }
  pageCount = ""
  next() {

    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];
    this.tagline = "";

    if (this.counter < this.allPages.length) {
      this.counter++;
      let Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
      this.location.go(Url);
      this.currentPageContent = this.allPages[this.counter];

      if (this.currentPageContent.paragraph["content:paragraph"] != undefined) {
        this.summary_line = this.currentPageContent.paragraph["content:paragraph"]["content:text"];
        if (typeof this.summary_line != "string") {
          this.multiple_summary_line = this.summary_line;
          this.summary_line = '';
        }
      } else this.summary_line = '';
      this.call_to_action = this.currentPageContent.call_to_action;
      this.paras = this.currentPageContent.paras;

      if (this.currentPageContent.cards.length > 0) {
        this.Cards = this.currentPageContent.cards;
        for (let i = 0; i < this.Cards.length; i++) {
          if(this.Cards[i].localImage == undefined )this.Cards[i].localImage = [];
          for (let j = 0; j < this.Cards[i].image.length; j++) {
            if (this.Cards[i].image[j] == "") {
              this.Cards[i].localImage[j] ="";
            }
            else {
              this.Cards[i].localImage[j] = this.sanitizer.bypassSecurityTrustUrl(localStorage.getItem(this.Cards[i].image[j]));
            }
          }
        }
      }
    }
  }

  previous() {
    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];
    this.currentPageContent = {};
    this.tagline = "";
    if (this.counter > 0) {
      this.counter--;
      let Url = this.router.createUrlTree(['/home', this.BookID, this.lang, this.counter]).toString();
      this.location.go(Url);
      this.currentPageContent = this.allPages[this.counter];

      if (this.currentPageContent.paragraph["content:paragraph"] != undefined) {
        this.summary_line = this.currentPageContent.paragraph["content:paragraph"]["content:text"];
        if (typeof this.summary_line != "string") {
          this.multiple_summary_line = this.summary_line;
          this.summary_line = '';
          // for (let index = 0; index < this.summary_line.length; index++) {
          //   this.summary_line[index] = this.summary_line[index] + '</br>';          
          // } 
        }
      } else this.summary_line = '';
      this.call_to_action = this.currentPageContent.call_to_action;
      this.paras = this.currentPageContent.paras;

      if (this.currentPageContent.cards.length > 0) {
        this.Cards = this.currentPageContent.cards;
        for (let i = 0; i < this.Cards.length; i++) {
          if(this.Cards[i].localImage == undefined )this.Cards[i].localImage = [];
          for (let j = 0; j < this.Cards[i].image.length; j++) {
            if (this.Cards[i].image[j] == "") {
              this.Cards[i].localImage[j] ="";
            }
            else {
              this.Cards[i].localImage[j] = this.sanitizer.bypassSecurityTrustUrl(localStorage.getItem(this.Cards[i].image[j]));
            }
          }

        }
      }
      // this.Cards = this.currentPageContent.cards;
      // this.cardsContent = this.Cards;
      // if (this.currentPageContent["call-to-action"]) {
      //   this.tagline = this.currentPageContent["call-to-action"]["content:text"];
      // }
    }
  }

  selectedPage(pageid) {



    this.tagline = "";
    this.Cards = [];
    this.cardsContent = [];
    this.tagline = "";
    if (this.counter < this.allPages.length) {
      this.counter++;
      this.currentPageContent = this.allPages[pageid];

      if (this.currentPageContent.paragraph["content:paragraph"] != undefined) {
        this.summary_line = this.currentPageContent.paragraph["content:paragraph"]["content:text"];
        if (typeof this.summary_line != "string") {
          this.multiple_summary_line = this.summary_line;
          this.summary_line = '';
          // for (let index = 0; index < this.summary_line.length; index++) {
          //   this.summary_line[index] = this.summary_line[index] + '</br>';          
          // } 
        }
      } else this.summary_line = '';
      this.call_to_action = this.currentPageContent.call_to_action;
      this.paras = this.currentPageContent.paras;

      if (this.currentPageContent.cards.length > 0) {
        this.Cards = this.currentPageContent.cards;
        for (let i = 0; i < this.Cards.length; i++) {
          if(this.Cards[i].localImage == undefined )this.Cards[i].localImage = [];
          for (let j = 0; j < this.Cards[i].image.length; j++) {
            if (this.Cards[i].image[j] == "") {
              this.Cards[i].localImage[j] ="";
            }
            else {
              this.Cards[i].localImage[j] = this.sanitizer.bypassSecurityTrustUrl(localStorage.getItem(this.Cards[i].image[j]));
            }
          }
        }
      }
    }
  }

}
