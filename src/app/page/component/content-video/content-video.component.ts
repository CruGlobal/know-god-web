import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { Video, FlowWatcher } from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-video',
  templateUrl: './content-video.component.html',
  styleUrls: ['./content-video.component.css']
})
export class ContentVideoComponent implements OnChanges, OnDestroy {
  @Input() item: Video;

  video: Video;
  ready: boolean;
  provider: string;
  videoId: string;
  videoUrl: SafeResourceUrl;
  dir$: Observable<string>;
  isHidden: boolean;
  isHiddenWatcher: FlowWatcher;
  state: any;

  constructor(
    private pageService: PageService,
    public sanitizer: DomSanitizer
  ) {
    this.dir$ = this.pageService.pageDir$;
    this.state = this.pageService.parserState();
  }

  ngOnDestroy(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
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
    // Initialize visibility watcher
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();

    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    this.provider = this.video.provider.name || '';
    this.videoId = this.video.videoId || '';
    setTimeout(() => {
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${this.videoId}`
      );
    }, 0);
    this.ready = true;
  }
}
