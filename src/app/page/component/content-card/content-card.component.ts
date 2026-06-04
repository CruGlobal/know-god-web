import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  Card,
  Content
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-card',
  templateUrl: './content-card.component.html',
  styleUrls: ['./content-card.component.css']
})
export class ContentCardComponent implements OnChanges {
  @Input() item: Card;
  card: Card;
  contents: Content[];
  background: string;
  ready: boolean;
  state: any;

  constructor(private pageService: PageService) {
    this.state = this.pageService.parserState();
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
              this.card = this.item;
              this.init();
            }
          }
        }
      }
    }
  }

  onClick(): void {
    this.pageService.handleClickable(this.card.events);
  }

  private init(): void {
    this.background = this.card.backgroundColor;
    const contents: Content[] = [];
    this.card.content.forEach((content) =>
      content ? contents.push(content) : null
    );
    this.contents = contents;
    this.ready = true;
  }
}
