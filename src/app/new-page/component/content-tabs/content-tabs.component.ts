import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { PageService } from '../../service/page-service.service';
import {
  Tabs,
  Tab,
  Content,
} from 'src/app/services/xml-parser-service/xmp-parser.service';

interface TabWithContent {
  tab: Tab;
  contents: Content[];
}

@Component({
  selector: 'app-content-new-tabs',
  templateUrl: './content-tabs.component.html',
  styleUrls: ['./content-tabs.component.css'],
})
export class ContentTabsNewComponent implements OnChanges {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() item: Tabs;

  tabs: Tabs;
  content: TabWithContent[];
  contents: Content[];
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
              this.tabs = this.item;
              this.content = [];
              this.contents = [];
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
    this.tabs.tabs.forEach((tab) => {
      const contents: Content[] = [];
      if (tab.content)
        tab.content.forEach((content) =>
          content ? contents.push(content) : null,
        );
      this.content.push({ tab, contents });
    });
    this.ready = true;
  }
}
