import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeTab } from '../../model/xmlns/content/content-ct-tab';
import { KgwContentComplexTypeTabs } from '../../model/xmlns/content/content-ct-tabs';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-tabs',
  templateUrl: './content-tabs.component.html',
  styleUrls: ['./content-tabs.component.css']
})
export class ContentTabsComponent implements OnInit {

  @Input('item') item : KgwContentElementItem;

  tabs: KgwContentComplexTypeTabs;
  content: Array<KgwContentComplexTypeTab>;
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
              this.ready = false;
              this.tabs = this.item.element as KgwContentComplexTypeTabs;
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
      this.tabs.tabs.forEach(
        tab => {
          tab.children = this.pageService.checkContentElements(tab.children);
          this.content.push(tab);
        }
      );
    }
    
    this.ready = true;
  }

}
