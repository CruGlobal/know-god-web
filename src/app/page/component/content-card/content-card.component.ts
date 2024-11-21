import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  Card,
  Content,
  EventId
} from 'src/app/services/xml-parser-service/xmp-parser.service';
import { formatEvents } from 'src/app/shared/formatEvents';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-new-card',
  templateUrl: './content-card.component.html',
  styleUrls: ['./content-card.component.css']
})
export class ContentCardComponent implements OnChanges {
  @Input() item: Card;
  card: Card;
  contents: Content[];
  background: string;
  url: string;
  events: EventId[];
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

  async eventClick(): Promise<void> {
    if (this.events.length)
      await this.pageService.formAction(formatEvents(this.events));
    if (this.url) window.open(this.url, '_blank');
  }

  private init(): void {
    this.background = this.card.backgroundColor;
    this.events = this.card.events;
    this.url = this.card.url;
    const contents: Content[] = [];
    this.card.content.forEach((content) =>
      content ? contents.push(content) : null
    );
    this.contents = contents;
    this.ready = true;
  }
}
