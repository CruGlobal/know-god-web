import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Content,
  Text,
  TractPageCard
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-page-new-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnChanges {
  @Input() card: TractPageCard;

  ready: boolean;
  label: Text;
  labelText: string;
  cardPosition: number;
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
              this.cardPosition = 0;
              this.content = [];
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
    this.cardPosition = this.card.position || 0;
    if (this.card.label) {
      this.label = this.card.label;
      this.labelText = this.card.label.text?.trim() || '';
    }

    this.content = this.card.content;

    this.ready = true;
  }
}
