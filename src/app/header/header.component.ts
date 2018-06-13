import { Component, OnInit } from '@angular/core';
import { CommonService } from '../services/common.service';
import { APIURL } from '../api/url';
import { TextDecoder } from '../../../node_modules/text-encoding/index.js';
import { Parser } from 'xml2js';
import { NgxXml2jsonService } from 'ngx-xml2json';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

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
  page={
    translationId:"",
    filename: "",
    src: ""
  };
  resource = {
    translationId:"",
    filename: "",
    src: ""
  };
  pages = [];
  resources = [];
  pageContents = [];
  constructor(public commonService: CommonService, private ngxXml2jsonService: NgxXml2jsonService) {
    this.AllBooks();
    this.AllLanguages();

  }

  ngOnInit() {
    //this.getZipFiles(1155);
  }

  AllBooks() {
    this.commonService.getBooks(APIURL.GET_ALL_BOOKS)
      .subscribe((data: any) => {
        this.allBooks = data.data;

      })
  }

  AllLanguages() {
    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES)
      .subscribe((data: any) => {
        this.allLanguages = data.data;

      })
  }

  selectLanguage(value, id) {
    this.selectLan = value
    this.selectedLanguageId = id
    console.log("Selected Language Id:", this.selectedLanguageId)
    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES + id)
      .subscribe((data: any) => {
        this.currentLanguageTransalations = data.data.relationships.translations.data;
        console.log("currentLanguageTranslations:", this.currentLanguageTransalations)
        this.translationsMapper(this.currentBookTranslations, this.currentLanguageTransalations);
        console.log("currentTranslations:", this.currentTranslations);
        // for (let i = 0; i < this.currentTranslations.length; i++) {
        //   this.getXmlFiles(this.currentTranslations[i]);
        // }
        this.getXmlFiles(this.currentTranslations[0]);
      })

  }

  selectBook(value, id) {
    this.selectbook = value;
    this.selectedBookId = id;
    console.log("Selected Book Id:", this.selectedBookId)
    this.commonService.getBooks(APIURL.GET_ALL_BOOKS + id + "?include=translations")
      .subscribe((data: any) => {
        this.currentBookTranslations = data.included;
        console.log("currentBookTranslations:", this.currentBookTranslations)
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
  getXmlFiles(id) {
    console.log(id);
    let manifest_name = id.attributes["manifest-name"];
    let translationId = id.id;
    console.log("translationId:", translationId);
    console.log("Manifest-name:", manifest_name);
    this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST + translationId + "/" + manifest_name)
      .subscribe(data => {
        console.log("data:", data);

        //Convertion of array buffer to xml
        let enc = new TextDecoder("utf-8");
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);
        console.log("result:", result);

        //convertion of xml to json
        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'text/xml');
        let jsondata = this.ngxXml2jsonService.xmlToJson(xml);
        console.log("JSON:", jsondata);

        // All Pages in xml file
        for(let j=0; j<jsondata["manifest"]["pages"]["page"].length; j++){
          this.page.filename = jsondata["manifest"]["pages"]["page"][j]["@attributes"]["filename"];
          this.page.src = jsondata["manifest"]["pages"]["page"][j]["@attributes"]["src"];
          this.page.translationId = translationId;
          console.log(this.page);
          this.pages.push(this.page);
          this.getXmlFileForEachPage(this.page);
          this.page={filename:"", src:"", translationId:""};
          
        }
        console.log("Pages:", this.pages);

        //All resources in xml file
        for(let j=0; j<jsondata["manifest"]["resources"]["resource"].length; j++){
          this.resource.filename = jsondata["manifest"]["resources"]["resource"][j]["@attributes"]["filename"];
          this.resource.src = jsondata["manifest"]["resources"]["resource"][j]["@attributes"]["src"];
          this.resource.translationId = translationId;
          this.pages.push(this.resource);
          this.resources.push(this.resource);
          this.resource={filename:"", src:"", translationId:""};
        }
        console.log("Resources:", this.resources);
        

      });
  }

  getXmlFileForEachPage(page){
    console.log(page);
    this.commonService.downloadFile(APIURL.GET_XML_FILES_FOR_MANIFEST+"/"+page.translationId+"/"+page.src)
    .subscribe((data:any) => {
      console.log(data);

      //Convertion of array buffer to xml
        let enc = new TextDecoder("utf-8");
        let arr = new Uint8Array(data);
        let result = enc.decode(arr);
        console.log("result:", result);
        let obj = {
          xmlFile: result,
          filename: page.filename,
          translationId: page.translationId,
          src: page.src
        }
        console.log(obj);

        //convertion of xml to json
        const parser = new DOMParser();
        const xml = parser.parseFromString(result, 'application/xml');
        let jsondata = this.ngxXml2jsonService.xmlToJson(xml);
        console.log("JSON:", jsondata);

    })
  }

 

  

}
