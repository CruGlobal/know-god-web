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
  isInvisible: boolean;
  isHiddenWatcher: FlowWatcher;
  isInvisibleWatcher: FlowWatcher;
  state: any;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.isModal$ = this.pageService.isModal$;
    this.state = this.pageService.parserState();
  }

  ngOnDestroy(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();
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
    // Initialize visibility watchers
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();

    // Watch for gone-if expressions (removes from DOM)
    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    // Watch for invisible-if expressions (hides but keeps space)
    this.isInvisibleWatcher = this.item.watchIsInvisible(
      this.state,
      (value) => (this.isInvisible = value)
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
