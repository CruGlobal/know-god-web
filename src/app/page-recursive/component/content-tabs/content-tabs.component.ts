import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
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
              this.tabs = this.item.element as KgwContentComplexTypeTabs;
              this.ready = false;
              setTimeout(() => { this.init(); }, 0);
            }
          }
        }
      }
    }
  }

  private init(): void {
    console.log("[CONTENT TEXT]: tabs:", this.tabs);
    this.ready = true;
  }

}
