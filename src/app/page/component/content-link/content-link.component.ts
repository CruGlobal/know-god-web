import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  EventId,
  FlowWatcher,
  Link,
  Text
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { formatEvents } from 'src/app/shared/formatEvents';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-link',
  templateUrl: './content-link.component.html',
  styleUrls: ['./content-link.component.css']
})
export class ContentLinkComponent implements OnChanges, OnDestroy {
  @Input() item: Link;

  link: Link;
  text: Text;
  ready: boolean;
  linkText: string;
  events: EventId[];
  dir$: Observable<string>;
  isHidden: boolean;
  isHiddenWatcher: FlowWatcher;
  state: any;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
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
              this.linkText = '';
              this.events = null;
              this.text = null;
              this.link = this.item;
              this.init();
            }
          }
        }
      }
    }
  }

  formAction(): void {
    if (this.events) {
      this.pageService.formAction(formatEvents(this.events));
    }
  }

  private init(): void {
    // Initialize visibility watcher
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();

    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    this.text = this.link.text || null;
    this.linkText = this.link.text?.text || '';
    this.events = this.link.events;
    this.ready = true;
  }
}
