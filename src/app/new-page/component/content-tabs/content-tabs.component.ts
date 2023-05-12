import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeTab } from '../../model/xmlns/content/content-ct-tab';
import { KgwContentComplexTypeTabs } from '../../model/xmlns/content/content-ct-tabs';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';
import { ContentItems } from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-content-new-tabs',
  templateUrl: './content-tabs.component.html',
  styleUrls: ['./content-tabs.component.css']
})
export class ContentTabsNewComponent implements OnChanges {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() item: ContentItems;

  tabs: KgwContentComplexTypeTabs;
  content: Array<KgwContentComplexTypeTab>;
  ready: boolean;
  dir$: Observable<string>;
  isModal$: Observable<boolean>;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.isModal$ = this.pageService.isModal$;
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
              this.tabs = this.item as KgwContentComplexTypeTabs;
              this.content = [];
              this.init();
            }
          }
        }
      }
    }
  }

  trackByFn(index, item) {
    return index;
  }

  private init(): void {
    if (this.tabs.tabs && this.tabs.tabs.length) {
      this.tabs.tabs.forEach((tab) => {
        this.content.push(tab);
      });
    }

    this.ready = true;
  }
}
