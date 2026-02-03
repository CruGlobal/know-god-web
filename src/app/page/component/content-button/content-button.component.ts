import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  Button,
  EventId,
  FlowWatcher,
  ParserState,
  Text
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { formatEvents } from 'src/app/shared/formatEvents';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-button',
  templateUrl: './content-button.component.html',
  styleUrls: ['./content-button.component.css']
})
export class ContentButtonComponent implements OnChanges, OnDestroy {
  @Input() item: Button;

  button: Button;
  text: Text;
  ready: boolean;
  buttonText: string;
  type: string;
  events: EventId[];
  url: string;
  buttonTextColor: string;
  buttonBgColor: string;
  dir$: Observable<string>;
  isHidden: boolean;
  isInvisible: boolean;
  isHiddenWatcher: FlowWatcher;
  isInvisibleWatcher: FlowWatcher;
  state: ParserState;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
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
              this.buttonText = '';
              this.type = '';
              this.events = [] as EventId[];
              this.url = '';
              this.text = null;
              this.button = this.item;
              this.buttonTextColor = '';
              this.buttonBgColor = '';
              this.init();
            }
          }
        }
      }
    }
  }

  formAction(): void {
    if (this.events && this.type === 'event') {
      // Each event can resolve into an array of events, so combine them into a single array.
      // This is necessary to support complex form actions with 'state' in the EventId.
      // (`Array.flatMap` isn't supported yet, so we use `[].concat(...arrays)`)
      const resolvedEvents = [].concat(
        ...this.events.map((event) =>
          event.resolve(this.pageService.parserState()).asJsReadonlyArrayView()
        )
      );

      this.pageService.formAction(formatEvents(resolvedEvents));
    }
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

    // TODO Allow Button styles when Books are ready
    // this.buttonTextColor = this.button.buttonColor || ''
    // this.buttonBgColor = this.button.backgroundColor || ''
    if (this.button.text) {
      this.text = this.button.text;
      this.buttonText = this.text?.text || '';
    }
    const isUrlType = !!this.button.url;
    const isEventType = !!this.button.events?.length;

    if (isUrlType) {
      this.type = 'url';
      this.url = this.button.url;
    }
    if (isEventType) {
      this.type = 'event';
      this.events = this.button.events;
    }
    this.ready = true;
  }
}
