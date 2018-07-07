import { Component, OnInit } from '@angular/core';
import { CommonService } from '../services/common.service';
import { APIURL } from '../api/url';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    // allBooks: any;
    imageUrl: any;
    resourceIds = [];
    images = [];
    image1: any;
    image2: any;
    image3: any;
    image4: any;
    image5: any;
    image6: any;
    image7: any;
    description: any;
    allBooks = [];
    allLanguages = [];
    selectedBookLanguauageTranslations = [];
    isBooksSelected = false;
    isLanguagesSelected = false;
    selectedLookup = {
        bookname: '',
        language: '',
        languageId: "",
        bookId: "",
        pageId: '',

    };
    selectedBook: any;
    selectedLanguage: any;
    resourceId: any;

    constructor(public route: Router,
        public router: ActivatedRoute,
        public commonService: CommonService,
        public sanitizer: DomSanitizer,
        private ngxXml2jsonService: NgxXml2jsonService) {
        //fetch All the books and langauges
     //   this.AllBooks();
     this. getAttachments();
        this.getAllBooksFromApi();

        this.getAllLangaugesFromApi();
    }
    getAllBooksFromApi(id = "") {
        if (this.commonService.allBooks.length > 0) {
            this.allBooks = this.commonService.allBooks;
        }
        else {
            this.commonService.getBooks(APIURL.GET_ALL_BOOKS)
                .subscribe((data: any) => {
                    this.commonService.allBooks = data.data;
                    this.allBooks = data.data;
                    if (id != "") {
                        this.selectedBook = this.allBooks.filter(x => x.attributes.abbreviation == id)[0];
                        console.log(this.selectedBook);
                        this.selectedLookup.bookname = this.selectedBook.attributes.name;
                    }
                    else {
                        // let book = this.allBooks.filter(x=>x.attributes.abbreviation==id)[0];
                        // this.selectedLookup.bookname =book.attributes.name;
                    }
                });
        }
    }
    getAllLangaugesFromApi(id = "") {
        if (this.commonService.allLanguages.length > 0) {
            this.allLanguages = this.commonService.allLanguages;
        }
        else {
            this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES)
                .subscribe((data: any) => {
                    this.allLanguages = data.data;
                    if (id != "") {
                        this.selectedBookLanguauageTranslations = this.allLanguages.filter(x => x.id == id);
                        console.log(this.selectedBookLanguauageTranslations);
                        this.selectedLookup.language = this.allLanguages.filter(x => x.attributes.code == id)[0].attributes.name;
                        this.selectedLookup.languageId = this.allLanguages.filter(x => x.attributes.code == id)[0].attributes.code;
                    }
                    else {
                        this.selectedBookLanguauageTranslations = this.allLanguages;
                        let item;
                        if(!this.commonService.selectedLan){
                            item = this.allLanguages.filter(x => x.attributes.code == "en")[0];
                          
                        }
                        else{
                            item = this.allLanguages.filter(x => x.attributes.code == this.commonService.selectedLan.attributes.code)[0];
                        }
                        this.selectedLookup.languageId = item.attributes.code;
                        this.selectedLookup.language = item.attributes.name;
                       
                        //this.route.navigateByUrl('/home/'+ this.selectedLookup.languageId);
                    }
                });
        }
    }

    loadBookFromUrl() {

    }
    selectBookFromDropdown(item) {
        this.isBooksSelected = !this.isBooksSelected;
        this.selectedBook = item;
        this.selectedLookup.bookname = item.attributes.name;
        this.route.navigateByUrl('home/' + item.attributes.abbreviation + '/' + this.selectedLookup.languageId);
    }
    selecteLanguageFromDropdown(item) {
        this.isLanguagesSelected = !this.isLanguagesSelected;
        this.selectedLanguage = item;
        this.selectedLookup.language = item.attributes.name;
        this.selectedLookup.languageId = item.attributes.code;
        this.commonService.selectedLan=item;
    }
    expandBookDropdown(item) {
        this.isBooksSelected = !this.isBooksSelected;
    }

    expandLanguageDropdown(item) {
        this.isLanguagesSelected = !this.isLanguagesSelected;
    }


    ImageUrl;
    Images = [];
    getAttachments() {
        let url = APIURL.GET_ALL_BOOKS  + "?include=attachments";
        this.commonService.getBooks(url)
            .subscribe((data: any) => {
                for(let k=0;k<data.data.length;k++){
                    this.description = data.data[k].attributes.description;
                    let resourceName = data.data[k].attributes.name;
                    let resourceId = data.data[k].id;
                   let bannerId = data.data[k].attributes["attr-banner"];
                   for (let i = 0; i < data.included.length; i++) {
                        if (bannerId == data.included[i].id) {
                            this.ImageUrl = data.included[i].attributes.file
                            this.Images.push({ description: this.description, ImgUrl: this.ImageUrl, resource: resourceName, id: resourceId })
                           
                        }
                    }
                }
                

            })
    }


    navigateToPage(id) {
        let book = this.allBooks.find(x => x.id == id).attributes.abbreviation;
        this.route.navigateByUrl('home/' + book + '/' + this.selectedLookup.languageId);
    }




}