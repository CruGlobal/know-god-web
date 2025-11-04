import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Button,
  EventId
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { formatEvents } from 'src/app/shared/formatEvents';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-button',
  templateUrl: './content-button.component.html',
  styleUrls: ['./content-button.component.css']
})
export class ContentButtonComponent implements OnChanges {
  @Input() item: Button;

  button: Button;
  text: any;
  ready: boolean;
  buttonText: string;
  type: string;
  events: EventId[];
  url: string;
  buttonTextColor: string;
  buttonBgColor: string;
  dir$: Observable<string>;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
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
