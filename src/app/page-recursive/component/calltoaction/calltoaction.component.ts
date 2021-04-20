import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeText } from '../../model/xmlns/content/content-ct-text';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { KgwTractComplexTypeCallToAction } from '../../model/xmlns/tract/tract-ct-call-to-action';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-page-calltoaction',
  templateUrl: './calltoaction.component.html',
  styleUrls: ['./calltoaction.component.css']
})
export class CalltoactionComponent implements OnInit {

  @Input('item') item : KgwTractComplexTypeCallToAction;

  text: KgwContentComplexTypeText;
  ready: boolean;
  actionText: string;
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
              this.actionText = '';
              this.ready = false;
              setTimeout(() => { this.init(); }, 0);
            }
          }
        }
      }
    }
  }

  private init(): void {
    if (this.item.text) {
      this.text = this.item.text;
      if (this.text && this.text.value) {
        this.actionText = this.text.value.trim().replace(/<br\s*[\/]?>/gi, ' ');
      }      
    }
    this.ready = true;
  }

}
