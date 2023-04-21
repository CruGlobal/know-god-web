import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeVideo } from '../../model/xmlns/content/content-ct-video';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-video',
  templateUrl: './content-video.component.html',
  styleUrls: ['./content-video.component.css']
})
export class ContentVideoComponent implements OnChanges {
  @Input() item: KgwContentElementItem;

  video: KgwContentComplexTypeVideo;
  ready: boolean;
  provider: string;
  videoId: string;
  videoUrl: SafeResourceUrl;
  dir$: Observable<string>;

  constructor(
    private pageService: PageService,
    public sanitizer: DomSanitizer
  ) {
    this.dir$ = this.pageService.pageDir$;
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'item': {
            if (
              !changes['item'].previousValue ||
              changes['item'].currentValue !== changes['item'].previousValue
            ) {
              this.provider = '';
              this.videoId = '';
              this.video = this.item.element as KgwContentComplexTypeVideo;
              this.ready = false;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    if (this.video.attributes.provider) {
      this.provider = this.video.attributes.provider;
    }

    if (this.video.attributes.videoId) {
      setTimeout(() => {
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${this.video.attributes.videoId}`
        );
        this.videoId = this.video.attributes.videoId;
      }, 0);
    }

    this.ready = true;
  }
}
