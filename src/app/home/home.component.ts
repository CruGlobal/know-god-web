import { Component, OnInit } from '@angular/core';
import { CommonService } from '../services/common.service';
import { APIURL } from '../api/url';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  allBooks: any;
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
  constructor(public commonService: CommonService, public sanitizer: DomSanitizer) {
    this.AllBooks();
  }

  ngOnInit() {
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


}
