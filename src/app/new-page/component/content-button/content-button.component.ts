import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeButton } from '../../model/xmlns/content/content-ct-button';
import { KgwContentComplexTypeText } from '../../model/xmlns/content/content-ct-text';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';
import { Button, EventId } from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-content-new-button',
  templateUrl: './content-button.component.html',
  styleUrls: ['./content-button.component.css']
})
export class ContentButtonNewComponent implements OnChanges {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() item: Button;

  button: Button;
  text: any;
  ready: boolean;
  buttonText: string;
  type: string;
  events: EventId[];
  url: string;
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
              this.init();
            }
          }
        }
      }
    }
  }

  formAction(): void {
    if (this.events && this.type === 'event') {
      let action = ''
      this.events.forEach((event, idx) => {
        const value = event?.namespace ? `${event.namespace}:${event.name}` : event.name
        action += idx ? ` ${value}` : value
      })
      this.pageService.formAction(action);
    }
  }

  private init(): void {
    console.log('this.button', this.button)
    if (this.button.text) {
      this.text = this.button.text;
      this.buttonText = this.text?.text || ''
    }
    const isUrlType = !!this.button.url;
    const isEventType = !!this.button.events?.length;
    
    
    console.log('isUrlType', isUrlType)
    console.log('isEventType', isEventType)
    if (isUrlType) {
      this.type = 'url'
      this.url = this.toAbsoluteUrl(this.button.url);
    }
    if (isEventType) {
      this.type = 'event';
      this.events = this.button.events;
    }
    this.ready = true;
  }

  private toAbsoluteUrl(url: string): string {
    if (!url || url.trim().length === 0) {
      return '';
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }
    return url;
  }
}
