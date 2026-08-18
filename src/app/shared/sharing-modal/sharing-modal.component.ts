import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Clipboard } from 'ts-clipboard';
import { buildShareUrl } from '../../api/url';

@Component({
  selector: 'app-sharing-modal',
  templateUrl: './sharing-modal.component.html',
  styleUrls: ['./sharing-modal.component.css']
})
export class SharingModalComponent implements OnInit {
  @Input()
  book: string;
  ShareState = 'min';

  constructor(private toastr: ToastrService) {}

  ngOnInit() {
    this.ShareState = 'min';
  }

  CopyToClipboard() {
    const url = location.href;
    Clipboard.copy(url);

    this.toastr.success(url + '     ', 'Link copied to clipboard');

    document.getElementById('toast-container').style.top = '261px';
    document.getElementById('toast-container').style.left = '650px';
  }

  shareTo(type: string): void {
    const url = buildShareUrl(type, this.book, window.location.href);
    if (!url) {
      return;
    }
    window.open(url, '_blank', 'noopener');
  }
}
