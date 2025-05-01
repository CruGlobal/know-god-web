import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Content,
  Tab,
  Tabs
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

interface TabWithContent {
  tab: Tab;
  contents: Content[];
}

@Component({
  selector: 'app-content-tabs',
  templateUrl: './content-tabs.component.html',
  styleUrls: ['./content-tabs.component.css']
})
export class ContentTabsComponent implements OnChanges {
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

  trackByFn(index) {
    return index;
  }

  private init(): void {
    this.tabs.tabs.forEach((tab) => {
      const contents: Content[] = [];
      if (tab.content)
        tab.content.forEach((content) =>
          content ? contents.push(content) : null
        );
      this.content.push({ tab, contents });
    });
    this.ready = true;
  }
}
