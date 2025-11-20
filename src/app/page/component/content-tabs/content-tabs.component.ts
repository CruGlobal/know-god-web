import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Content,
  FlowWatcher,
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
export class ContentTabsComponent implements OnChanges, OnDestroy {
  @Input() item: Tabs;

  tabs: Tabs;
  content: TabWithContent[];
  contents: Content[];
  ready: boolean;
  dir$: Observable<string>;
  isModal$: Observable<boolean>;
  isHidden: boolean;
  isHiddenWatcher: FlowWatcher;
  state: any;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.isModal$ = this.pageService.isModal$;
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
    // Initialize visibility watcher
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();

    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

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
