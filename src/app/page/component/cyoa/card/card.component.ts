import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { PageService } from 'src/app/page/service/page-service.service';
import {
  CYOAPageCard,
  Content
} from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-page-cyoa-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CyoaCardComponent implements OnChanges {
  @Input() card: CYOAPageCard;
  @Input() totalCards: number;

  ready: boolean;
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

    this.content = this.card.content;

    console.log('card ', this.card);

    this.ready = true;
  }
}
