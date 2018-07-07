import { Component, OnInit, Input } from '@angular/core';
import { SHAREDURL, EMBED_URL } from '../../api/url';
import { Router } from '@angular/router';
import {CommonService} from '../../services/common.service';
@Component({
  selector: 'sharing-modal',
  templateUrl: './sharing-modal.component.html',
  styleUrls: ['./sharing-modal.component.css']
})
export class SharingModalComponent implements OnInit {

  @Input()
  book: any;
  currentUrl: string;
  embedUrl: string;

  constructor(private router: Router,public commonService:CommonService) {
    this.router.events.subscribe(() => {
      this.commonService.getUrl()
      .subscribe(x=>{
        console.log(window.location.hostname);
        let port = window.location.port;
        if(port){
          this.currentUrl=window.location.hostname+`:${port}`+x;
        }else{
          this.currentUrl=window.location.hostname + x;
        }        
        this.embedUrl = EMBED_URL.replace("EMBED_URL", this.currentUrl);
      });
      console.log(this.currentUrl);
    });
  }

  ngOnInit() {


  }


  shareTo(type): void {
    let url = "";
    switch (type) {
      case 'TWITTER':
        url = SHAREDURL.get(type).replace("BOOK_NAME",this.book).replace("BOOK_LINK",this.currentUrl)
        break;
      case 'MAILTO':
        url = SHAREDURL.get(type).replace("MAIL_SUBJECT",this.book).replace("MAIL_BODY",this.currentUrl)
        break;
      default:
        url = SHAREDURL.get(type) + this.currentUrl;
    }
    window.open(url, "_blank");
  }

}
