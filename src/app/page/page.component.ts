import { Component, OnInit } from '@angular/core';
import { CommonService } from '../services/common.service';
import { APIURL } from '../api/url';
import { TextDecoder } from '../../../node_modules/text-encoding/index.js';
import { Parser } from 'xml2js';
import { NgxXml2jsonService } from 'ngx-xml2json';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit {
  allResourcesImages: any;
  router: any;
  selectedBookLanguauageTranslations=[];
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
  constructor(public commonService: CommonService, private ngxXml2jsonService: NgxXml2jsonService, public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.AllBooks();
    this.AllLanguages();
  }

  /*To get all books*/
  AllBooks() {
    this.commonService.getBooks(APIURL.GET_ALL_BOOKS)
      .subscribe((data: any) => {
        this.allBooks = data.data;

      })
  }

  /*To get all languages*/
  AllLanguages() {
    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES)
      .subscribe((data: any) => {
        this.allLanguages = data.data;
        this.selectedBookLanguauageTranslations=[];
        console.log("Languages:", this.allLanguages)

      })
  }

  /*Language translations for selected book*/
  LanguagesForSelectedBook(){
    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES)
    .subscribe(( data:any) => {
      this.allLanguagesTranslations = data.data;
      for(let i=0; i<this.allLanguagesTranslations.length;i++){
        let language;
        let currentIterationTranslations = this.allLanguagesTranslations[i].relationships.translations.data;
        for (let j=0; j< currentIterationTranslations.length;j++){
          for(let k=0;k<this.currentBookTranslations.length;k++){
            if(this.currentBookTranslations[k].id == currentIterationTranslations[j].id){
              language = this.allLanguagesTranslations[i];
            }
          }
        }
        if(language==undefined){

        }
        else{
          this.selectedBookLanguauageTranslations.push(language);
        } 
      }
      console.log("selectedBookLanguageTranslations:", this.selectedBookLanguauageTranslations);
    })
  }

  selectLanguage(value, id) {
    //this.router.navigate(['/home/:book', value]);
    this.language = false;
    this.selectLan = value
    this.selectedLanguageId = id
    console.log("Selected Language Id:", this.selectedLanguageId)
    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES + id)
      .subscribe((data: any) => {
        this.currentLanguageTransalations = data.data.relationships.translations.data;
        //console.log("currentLanguageTranslations:", this.currentLanguageTransalations)
        this.translationsMapper(this.currentBookTranslations, this.currentLanguageTransalations);
        //console.log("currentTranslations:", this.currentTranslations);
        // for (let i = 0; i < this.currentTranslations.length; i++) {
        //   this.getXmlFiles(this.currentTranslations[i]);
        // }
        this.getXmlFiles(this.currentTranslations[0]);
      })

  }

  selectBook(value, id) {
    //this.router.navigate(['/home', value]);
    this.books = false;
    this.selectbook = value;
    this.selectedBookId = id;
    console.log("Selected Book Id:", this.selectedBookId)
    this.commonService.getBooks(APIURL.GET_ALL_BOOKS + id + "?include=translations")
      .subscribe((data: any) => {
        console.log(data);
        if(data.data["attributes"]["resource-type"]=="tract"){
          this.currentBookTranslations = data.included;
          this.LanguagesForSelectedBook();
        }
        
        //console.log("currentBookTranslations:", this.currentBookTranslations)
        // if(this.currentBookTranslations==undefined){
        //   alert("Language translations are not available for this book")
        // }
        // else{
          
        // }
        
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

  /*To get xml files for each translation Id*/
  getXmlFiles(id) {
    //console.log(id);
    let manifest_name = id.attributes["manifest-name"];
    let translationId = id.id;
    //console.log("translationId:", translationId);
    //console.log("Manifest-name:", manifest_name);
    this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + translationId + "/" + manifest_name)
      .subscribe(data => {
        //console.log("data:", data);

        //Convertion of array buffer to xml
        let enc = new TextDecoder("utf-8");
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);
        //console.log("result:", result);

        //convertion of xml to json
        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'text/xml');
        let jsondata = this.ngxXml2jsonService.xmlToJson(xml);
        //console.log("JSON:", jsondata);


        // All Pages in xml file
        for (let j = 0; j < jsondata["manifest"]["pages"]["page"].length; j++) {
          this.page.filename = jsondata["manifest"]["pages"]["page"][j]["@attributes"]["filename"];
          this.page.src = jsondata["manifest"]["pages"]["page"][j]["@attributes"]["src"];
          this.page.translationId = translationId;
          //console.log(this.page);
          this.pages.push(this.page);
          this.AllPagesContent = [];
          this.allPages=[];
          this.allResourcesImages=[];
          this.getXmlFileForEachPage(this.page);
          this.page = { filename: "", src: "", translationId: "" };

        }
        //console.log("Pages:", this.pages);

        //All resources in xml file
        for (let j = 0; j < jsondata["manifest"]["resources"]["resource"].length; j++) {
          this.resource.filename = jsondata["manifest"]["resources"]["resource"][j]["@attributes"]["filename"];
          this.resource.src = jsondata["manifest"]["resources"]["resource"][j]["@attributes"]["src"];
          this.resource.translationId = translationId;
          this.pages.push(this.resource);
          this.resources.push(this.resource);
          //this.getXmlFileForEachResource(this.resource);
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
        console.log("AllPages:",this.AllPagesContent)
        this.objectMapper(jsondata);
        // window.localStorage["JSONdata"] = jsondata;
        // var accessdata = window.localStorage["JSONdata"];
        // console.log("ACCESSDATA:", accessdata);
        
      })
  }

  imageUrl 
  /*To get images from xml files*/
  // getXmlFileForEachResource(resource) {
  //   console.log("Resource:", resource);
  //   this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + "/" + resource.translationId + "/" + resource.src)
  //     .subscribe((data: any) => {
  //       console.log("Resources xml data:", data);
  //       var data = data;
  //       var file = new Blob([data], {
  //         type: 'image/jpeg, image/png, image/gif'
  //       });
  //       //console.log("FIle:", file);
  //       var myFile = new File([file],resource.filename);
  //       console.log("IMage in FIle:", myFile)
  //       this.image = myFile.name;
  //       var fileURL = URL.createObjectURL(file);
  //       this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(fileURL);
  //       //this.imageUrl = this.sanitizer.bypassSecurityTrustUrl("url("+fileURL+")");
  //       var imageUrls = {filename:resource.filename, imageUrl:this.imageUrl}
  //       console.log("URL:", imageUrls);
  //       this.allResourcesImages.push(imageUrls);
  //       //this.AllPagesContent.push(fileURL);
  //       console.log("AllImages:",this.allResourcesImages)
  //       //window.open(fileURL);

  //     })
  // }


  Languages() {
    this.language = true;
    this.books = false
  }
  Books() {
    this.language = false;
    this.books = true;
  }

  allPages = [];

  objectMapper(resourcePage) {
    let heading, cards, paragraph, call_to_action, obj,attributes;
    obj={};
    heading ={};
    paragraph={};
    call_to_action={};
    cards={};
    attributes={};
    if (resourcePage.page.hero) {
      heading = resourcePage.page.hero.heading["content:text"];
      paragraph = resourcePage.page.hero;
      obj = resourcePage.page;
    }
    if (resourcePage.page.header) {
      heading = resourcePage.page.header.title["content:text"];
      obj = resourcePage.page;
      paragraph = '';
    }
    if (resourcePage.page.hero && resourcePage.page.cards) {
      heading = resourcePage.page.hero.heading["content:text"];
      paragraph = resourcePage.page.hero;
      obj = resourcePage.page;
    }
    obj.heading = heading;
    obj.paragraph = paragraph;
    this.allPages.push(obj);
    console.log("allPagesMapperObj:", this.allPages);
    //this.currentPageContent = this.allPages[this.counter];
    this.currentPage();
   
  }
Cards=[];
cardsContent=[];
paraGraph;
image;
tagline;

  currentPage(){
    this.tagline="";
    this.Cards=[];
    this.cardsContent=[];
    this.tagline="";
    this.currentPageContent = this.allPages[this.counter];
    this.Cards=this.currentPageContent.cards.card;
      this.cardsContent = this.Cards;
      for(let i=0;i<this.allResourcesImages.length;i++){
       if(this.currentPageContent["@attributes"]["background-image"]== this.allResourcesImages[i].filename){
        //this.image = this.allResourcesImages[i].imageUrl;
        console.log("this.image:", this.image);
       }
      }
      if(this.currentPageContent["call-to-action"]){
        this.tagline = this.currentPageContent["call-to-action"]["content:text"];
      }
      console.log("cards content:",this.cardsContent);
      console.log("tagline",this.tagline);

  }

  next() {
    this.tagline="";
    this.Cards=[];
    this.cardsContent=[];
    this.tagline="";
    if(this.counter<this.allPages.length){
      this.counter++;
      this.currentPageContent = this.allPages[this.counter];
      this.Cards=this.currentPageContent.cards.card;
      this.cardsContent = this.Cards;
      for(let i=0;i<this.allResourcesImages.length;i++){
       if(this.currentPageContent["@attributes"]["background-image"]== this.allResourcesImages[i].filename){
        this.image = this.allResourcesImages[i].imageUrl;
        console.log("this.image:", this.image);
       }
      }
      if(this.currentPageContent["call-to-action"]){
        this.tagline = this.currentPageContent["call-to-action"]["content:text"];
      }
      console.log("cards content:",this.cardsContent);
      console.log("tagline",this.tagline);
    }
  }

  previous() {
    this.tagline="";
    this.Cards=[];
    this.cardsContent=[];
    this.tagline="";
    if(this.counter>0){
      this.counter--;
      this.currentPageContent = this.allPages[this.counter];
      this.Cards=this.currentPageContent.cards.card;
      this.cardsContent = this.Cards;
      if(this.currentPageContent["call-to-action"]){
        this.tagline = this.currentPageContent["call-to-action"]["content:text"];
      }
    } 
  }
}
