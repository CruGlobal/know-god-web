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
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
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
    this.route.params.subscribe(params => {
      if (params['bookid'] && params['langid'] && params['pageid']) {
        //this.selectedPage(params['pageid']);
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

      })
				 
  }
  BookID = "";

  
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





  Languages() {
    this.language = !this.language;
    this.books = false
  }
  Books() {
    this.language = false;
    this.books = !this.books;

  }

  allPages = [];


  

}
