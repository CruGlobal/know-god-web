import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import {
  Card,
  Content,
  EventId,
  FlowWatcher
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { formatEvents } from 'src/app/shared/formatEvents';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-card',
  templateUrl: './content-card.component.html',
  styleUrls: ['./content-card.component.css']
})
export class ContentCardComponent implements OnChanges, OnDestroy {
  @Input() item: Card;
  card: Card;
  contents: Content[];
  background: string;
  url: string;
  events: EventId[];
  ready: boolean;
  state: any;
  isHidden: boolean;
  isHiddenWatcher: FlowWatcher;

  constructor(private pageService: PageService) {
    this.state = this.pageService.parserState();
  }

  ngOnDestroy(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
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
    // Initialize visibility watcher
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();

    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

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
