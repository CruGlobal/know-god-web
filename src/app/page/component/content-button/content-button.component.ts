import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { PageService } from '../../service/page-service.service';
import {
  Button,
  EventId
} from 'src/app/services/xml-parser-service/xmp-parser.service';
import { formatEvents } from 'src/app/shared/formatEvents';

@Component({
  selector: 'app-content-new-button',
  templateUrl: './content-button.component.html',
  styleUrls: ['./content-button.component.css']
})
export class ContentButtonComponent implements OnChanges {
  // eslint-disable-next-line @angular-eslint/no-input-rename
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
      this.pageService.formAction(formatEvents(this.events));
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
