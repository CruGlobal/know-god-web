import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { PageService } from 'src/app/page/service/page-service.service';
import {
  CYOAPageCard,
  Content
} from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-cyoa-card',
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

  constructor(private readonly pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('card')) {
      if (
        !changes.card.previousValue ||
        changes.card.currentValue !== changes.card.previousValue
      ) {
        this.ready = false;
        this.cardPosition = 0;
        this.content = [];
        this.init();
      }
    }
  }

  private init(): void {
    this.cardPosition = this.card.position || 0;

    this.content = this.card.content;

    this.ready = true;
  }
}
