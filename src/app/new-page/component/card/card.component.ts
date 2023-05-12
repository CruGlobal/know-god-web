import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { PageService } from '../../service/page-service.service';
import { org } from '@cruglobal/godtools-shared';
import { Card, Text, Content } from 'src/app/services/xml-parser-service/xmp-parser.service';
@Component({
  selector: 'app-page-new-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardNewComponent implements OnChanges {
  @Input() card: Card;
  @Input() cardIndex: number;

  ready: boolean;
  label: Text;
  labelText: string;
  content: Array<Content>;
  dir$: Observable<string>;
  isForm$: Observable<boolean>;
  isModal$: Observable<boolean>;
  isFirstPage$: Observable<boolean>;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
    this.isModal$ = this.pageService.isModal$;
    this.isFirstPage$ = this.pageService.isFirstPage$;
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'card': {
            if (
              !changes['card'].previousValue ||
              changes['card'].currentValue !== changes['card'].previousValue
            ) {
              this.ready = false;
              this.label = null;
              this.labelText = '';
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
    if (this.card.label) {
      this.label = this.card.label;
      this.labelText = this.card.label.text?.trim() || '';
    }

    this.content = this.card.content
    
    if (this.card.content.length) {
        // PIZZA
        // if (contentChild.contentType === 'form') {
        //   const tForm: KgwContentComplexTypeForm =
        //     contentChild as KgwContentComplexTypeForm;
        //   const tItemToAdd: KgwContentElementItem = {
        //     type: 'form',
        //     element: tForm
        //   };
        //   this.content.push(tItemToAdd);
        // }
    }
    this.ready = true;
  }
}
