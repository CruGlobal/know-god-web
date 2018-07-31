import { Component, OnInit, Input } from '@angular/core';
import { SHAREDURL, EMBED_URL } from '../../api/url';
import { Router,NavigationStart  } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { ToastrService } from 'ngx-toastr';
import { Clipboard } from 'ts-clipboard';
import { Location } from '@angular/common';

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
  ShareState = 'min';
  supported = false;
  textToCopy = '';

  constructor(private router: Router, public commonService: CommonService,
    private toastr: ToastrService,
    public location: Location,
  ) {

    this.router.events.subscribe(() => {
      this.commonService.getUrl()
        .subscribe(x => {

          let port = window.location.port;
          let protocol = window.location.protocol ? window.location.protocol + "//" : "";
          if (port) {
            this.currentUrl = protocol + window.location.hostname + `:${port}` + x;
          } else {
            this.currentUrl = protocol + window.location.hostname + x;
          }
          this.embedUrl = EMBED_URL.replace("EMBED_URL", this.currentUrl);
        });     
    });


    router.events.subscribe((event) => {
      if(event instanceof NavigationStart) {
        console.log ('navigation starts')
        console.log('this.currentUrl : ' + this.currentUrl);
        console.log('window.location.href : ' + window.location.href);
        if (this.currentUrl != undefined  && window.location.href != this.currentUrl) {
          let Url = this.router.createUrlTree([window.location.pathname]).toString();
          //console.log('Url : ' + Url);
          this.commonService.setCurrentUrl(window.location.href);
          
          //this.location.go(Url);
          this.router.navigateByUrl(window.location.pathname);
       //   window.location.assign( window.location.href); 
        }
      }
      // NavigationEnd
      // NavigationCancel
      // NavigationError
      // RoutesRecognized
    });
  }

  ngOnInit() {
    this.ShareState = 'min';

  }

  CopyToClipboard(event) {
    var url = location.href;
    Clipboard.copy(url);

    var options = {
      messageClass: 'toast-message1',
      positionClass: 'toast-top-right1',

    }
    this.toastr.success(url + '     ', "Link copied to clipboard");

    //$("#toast-container").css( {position:"absolute", top:e.pageY, left: e.pageX});
    //document.getElementById("toast-container").style.position = "absolute";
    // document.getElementById("toast-container").style.top = document.getElementById("lnkCopy").offsetTop + "px";
    // document.getElementById("toast-container").style.left = document.getElementById("lnkCopy").offsetLeft + "px";

    document.getElementById("toast-container").style.top = "261px";
    document.getElementById("toast-container").style.left = "650px";
  }



  shareTo(type): void {
    let url = "";
    switch (type) {
      case 'TWITTER':
        url = SHAREDURL.get(type).replace("BOOK_NAME", this.book).replace("BOOK_LINK", this.currentUrl)
        break;
      case 'MAILTO':
        url = SHAREDURL.get(type).replace("MAIL_SUBJECT", this.book).replace("MAIL_BODY", this.currentUrl)
        break;
      default:
        url = SHAREDURL.get(type) + this.currentUrl;
    }
    window.open(url, "_blank");
  }

}
