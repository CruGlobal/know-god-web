import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeForm } from '../../model/xmlns/content/content-ct-form';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-form',
  templateUrl: './content-form.component.html',
  styleUrls: ['./content-form.component.css']
})
export class ContentFormComponent implements OnInit {

  @Input('item') item : KgwContentComplexTypeForm;

  ready: boolean;
  items: Array<KgwContentElementItem>;
  dir$: Observable<string>;
  isForm$: Observable<boolean>;

  constructor(
    private pageService: PageService
  ) { 
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
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
              this.items = [];
              setTimeout(() => { this.init(); }, 0);
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.items = this.pageService.checkContentElements(this.item.children);
    this.ready = true;
  }

}
