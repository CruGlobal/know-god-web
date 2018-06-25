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
    isBooksSelected=false;
    isLanguagesSelected=false;
    selectedLookup ={
        bookname:'',
        language:'',
        languageId:"",
        bookId:"",
        pageId:'',
        
    };
    selectedBook: any;
    selectedLanguage:any;

    constructor(public route: Router,
        public router: ActivatedRoute,
        public commonService: CommonService,
        public sanitizer: DomSanitizer,
        private ngxXml2jsonService: NgxXml2jsonService) {
        //fetch All the books and langauges
        this.AllBooks();
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
                    else{
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
                        this.selectedLookup.language=this.allLanguages.filter(x=>x.attributes.code==id)[0].attributes.name;
                    }
                    else{
                        this.selectedBookLanguauageTranslations= this.allLanguages;
                        let item =this.allLanguages.filter(x=>x.attributes.code=='en')[0];
                        this.selectedLookup.languageId=item.attributes.code;
                        this.selectedLookup.language = item.attributes.name;
                        //this.route.navigateByUrl('/home/'+ this.selectedLookup.languageId);
                    }
                });
        }
    }

    loadBookFromUrl() {

    }
    selectBookFromDropdown(item){
        this.isBooksSelected=!this.isBooksSelected;
        this.selectedBook=item;
        this.selectedLookup.bookname =item.attributes.name;
        this.route.navigateByUrl('home/'+item.attributes.abbreviation + '/' + this.selectedLookup.languageId);
    }
    selecteLanguageFromDropdown(item){
        this.isLanguagesSelected=!this.isLanguagesSelected;
        this.selectedLanguage=item;
        this.selectedLookup.language =item.attributes.name;
    }
    expandBookDropdown(item){
        this.isBooksSelected = !this.isBooksSelected;
    }

    expandLanguageDropdown(item){
        this.isLanguagesSelected = !this.isLanguagesSelected;
    }


    AllBooks() {
        this.commonService.getBooks(APIURL.GET_ALL_BOOKS)
          .subscribe((data: any) => {
            this.allBooks = data.data;
            console.log(this.allBooks);
            for (let i = 0; i < this.allBooks.length; i++) {
              this.resourceIds.push({ resourceId: this.allBooks[i].id, 
                resource: this.allBooks[i].attributes.name });
            }
            console.log(this.resourceIds);
            for (let i = 0; i < this.resourceIds.length; i++) {
              this.getAttachments(this.resourceIds[i].resourceId, this.resourceIds[i].resource);
            }
          })
      }
    


    getAttachments(resourceId, resource) {
        let url = APIURL.GET_ALL_BOOKS + resourceId + "?include=attachments";
        this.commonService.getBooks(url)
          .subscribe((data: any) => {
            console.log(data);
            this.description=data.data.attributes.description
             let bannerId = data.data.attributes["attr-banner"];
          //  let bannerId = data.data;
            this.getImages(bannerId, resource);
          })
      }
    
      getImages(bannerId, resource) {
        let url = APIURL.GET_ATTACHMENTS + bannerId + "/download";
        console.log("url:-",url)
        this.commonService.downloadFile(url)
          .subscribe((data: any) => {
            console.log(data);
            var data = data;
            
            var file = new Blob([data], {
              type: 'image/jpeg, image/png, image/gif'
            });
            var fileURL = URL.createObjectURL(file);
            this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(fileURL);
            localStorage.setItem(resource, fileURL);
            localStorage.getItem(resource);
            //this.images.push( localStorage.getItem(resource));
            this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(localStorage.getItem(resource));
            this.images.push({imageurl:this.imageUrl,description:this.description, resource:resource,SrcImg:"https://mobile-content-api.cru.org/attachments/"+bannerId+"/download"});  
            
          })
      }
      navigateToPage(id){
          let book = this.allBooks[id].attributes.abbreviation;
          this.route.navigateByUrl('home/'+book + '/' + this.selectedLookup.languageId);
      }
}