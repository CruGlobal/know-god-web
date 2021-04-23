import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeVideo } from '../../model/xmlns/content/content-ct-video';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-video',
  templateUrl: './content-video.component.html',
  styleUrls: ['./content-video.component.css']
})
export class ContentVideoComponent implements OnInit {

  @Input('item') item : KgwContentElementItem;

  video: KgwContentComplexTypeVideo;
  ready: boolean;
  dir$: Observable<string>;

  constructor(
    private pageService: PageService
  ) { 
    this.dir$ = this.pageService.pageDir$;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'item': {
            if (!changes['item'].previousValue || changes['item'].currentValue !== changes['item'].previousValue) {
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
    this.ready = true;
  }

}
