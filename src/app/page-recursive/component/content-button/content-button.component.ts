import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeButton } from '../../model/xmlns/content/content-ct-button';
import { KgwContentComplexTypeText } from '../../model/xmlns/content/content-ct-text';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-button',
  templateUrl: './content-button.component.html',
  styleUrls: ['./content-button.component.css']
})
export class ContentButtonComponent implements OnInit {

  @Input('item') item : KgwContentElementItem;

  button: KgwContentComplexTypeButton;
  text: KgwContentComplexTypeText;
  ready: boolean;
  buttonText: string;
  type:string;
  events: string;
  url: string;
  dir$: Observable<string>;

  constructor(
    private pageService: PageService
  ) { 
    this.dir$ = this.pageService.pageDir$;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'item': {
            if (!changes['item'].previousValue || changes['item'].currentValue !== changes['item'].previousValue) {
              this.ready = false;
              this.buttonText = '';
              this.type = '';
              this.events = '';
              this.url = '';
              this.text = null;
              this.button = this.item.element as KgwContentComplexTypeButton;
              setTimeout(() => { this.init(); }, 0);
            }
          }
        }
      }
    }
  }

  formAction(): void {
    if (this.events && this.type === 'event') {
      this.pageService.formAction(this.events);
    }
  }

  private init(): void {
    if (this.button.text) {
      this.text = this.button.text;
      if (this.text && this.text.value) {
        this.buttonText = this.text.value.trim();
      }      
    }
    this.type = this.button.attributes.type;
    if (this.type === 'url') {
      this.url = this.toAbsoluteUrl(this.button.attributes.url);
    } else if (this.type === 'event') {
      this.events = this.button.attributes.events;
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
