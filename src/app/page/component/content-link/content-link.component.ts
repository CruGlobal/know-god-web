import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Link,
  Text
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-link',
  templateUrl: './content-link.component.html',
  styleUrls: ['./content-link.component.css']
})
export class ContentLinkComponent implements OnChanges {
  @Input() item: Link;

  link: Link;
  text: Text;
  ready: boolean;
  linkText: string;
  dir$: Observable<string>;

  constructor(private pageService: PageService) {
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
              this.ready = false;
              this.linkText = '';
              this.text = null;
              this.link = this.item;
              this.init();
            }
          }
        }
      }
    }
  }

  onClick(): void {
    this.pageService.handleClickable(this.link.events);
  }

  private init(): void {
    this.text = this.link.text || null;
    this.linkText = this.link.text?.text || '';
    this.ready = true;
  }
}
