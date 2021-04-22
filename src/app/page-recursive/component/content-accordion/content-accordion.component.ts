import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeAccordion } from '../../model/xmlns/content/content-ct-accordion';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-accordion',
  templateUrl: './content-accordion.component.html',
  styleUrls: ['./content-accordion.component.css']
})
export class ContentAccordionComponent implements OnInit {

  @Input('item') item : KgwContentElementItem;

  accordion: KgwContentComplexTypeAccordion;
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
              this.accordion = this.item.element as KgwContentComplexTypeAccordion;
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
