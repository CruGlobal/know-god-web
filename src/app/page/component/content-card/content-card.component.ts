import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {
  Card,
  Content,
  EventId,
  FlowWatcher,
  ParserState
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
  state: ParserState;
  isHidden: boolean;
  isInvisible: boolean;
  isHiddenWatcher: FlowWatcher;
  isInvisibleWatcher: FlowWatcher;

  constructor(private pageService: PageService) {
    this.state = this.pageService.parserState();
  }

  ngOnDestroy(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();
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
    // Initialize visibility watchers
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();

    // Watch for gone-if expressions (removes from DOM)
    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    // Watch for invisible-if expressions (hides but keeps space)
    this.isInvisibleWatcher = this.item.watchIsInvisible(
      this.state,
      (value) => (this.isInvisible = value)
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
