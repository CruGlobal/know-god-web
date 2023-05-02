import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { PageService } from '../../service/page-service.service';
import { Video } from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-content-new-video',
  templateUrl: './content-video.component.html',
  styleUrls: ['./content-video.component.css']
})
export class ContentVideoNewComponent implements OnChanges {
  @Input() item: Video;

  video: Video;
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
              this.video = this.item;
              this.ready = false;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.provider = this.video.provider.name || ''
    const videoId = this.video.videoId
    if (videoId) {
      setTimeout(() => {
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${videoId}`
        );
        this.videoId = videoId;
      }, 0);
    }
    this.ready = true;
  }
}
