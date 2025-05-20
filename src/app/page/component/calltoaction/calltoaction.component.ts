import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CallToAction,
  Text
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-page-calltoaction',
  templateUrl: './calltoaction.component.html',
  styleUrls: ['./calltoaction.component.css']
})
export class CalltoactionComponent implements OnChanges {
  @Input() item: CallToAction;

  text: Text;
  ready: boolean;
  actionText: string;
  dir$: Observable<string>;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
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
              this.actionText = '';
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    if (this.item.label) {
      this.text = this.item.label;
      if (this.text && this.item.label.text) {
        this.actionText = this.item.label.text
          .trim()
          .replace(/<br\s*[\/]?>/gi, ' ');
      }
    }
    this.ready = true;
  }
}
