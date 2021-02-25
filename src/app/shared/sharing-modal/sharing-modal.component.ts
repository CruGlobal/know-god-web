import { Component, OnInit, Input } from '@angular/core';
import { SHAREDURL } from '../../api/url';
import { ToastrService } from 'ngx-toastr';
import { Clipboard } from 'ts-clipboard';

@Component({
  selector: 'app-sharing-modal',
  templateUrl: './sharing-modal.component.html',
  styleUrls: ['./sharing-modal.component.css']
})
export class SharingModalComponent implements OnInit {
  @Input()
  book: any;
  currentUrl: string;
  ShareState = 'min';

  constructor(private toastr: ToastrService) {}

  ngOnInit() {
    this.ShareState = 'min';
  }

  CopyToClipboard(event) {
    const url = location.href;
    Clipboard.copy(url);

    const options = {
      messageClass: 'toast-message1',
      positionClass: 'toast-top-right1'
    };
    this.toastr.success(url + '     ', 'Link copied to clipboard');

    document.getElementById('toast-container').style.top = '261px';
    document.getElementById('toast-container').style.left = '650px';
  }

  shareTo(type): void {
    this.currentUrl = window.location.href;
    let url = '';
    switch (type) {
      case 'TWITTER':
        url = SHAREDURL.get(type)
          .replace('BOOK_NAME', this.book)
          .replace('BOOK_LINK', this.currentUrl);
        break;
      case 'MAILTO':
        url = SHAREDURL.get(type)
          .replace('MAIL_SUBJECT', this.book)
          .replace('MAIL_BODY', this.currentUrl);
        break;
      default:
        url = SHAREDURL.get(type) + this.currentUrl;
    }
    window.open(url, '_blank');
  }
}
