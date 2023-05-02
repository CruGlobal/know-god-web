import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeLink } from '../../model/xmlns/content/content-ct-link';
import { KgwContentComplexTypeText } from '../../model/xmlns/content/content-ct-text';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-link',
  templateUrl: './content-link.component.html',
  styleUrls: ['./content-link.component.css']
})
export class ContentLinkComponent implements OnChanges {
  @Input() item: KgwContentElementItem;

  link: KgwContentComplexTypeLink;
  text: KgwContentComplexTypeText;
  ready: boolean;
  linkText: string;
  events: string;
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
              this.linkText = '';
              this.events = '';
              this.link = this.item.element as KgwContentComplexTypeLink;
              this.init();
            }
          }
        }
      }
    }
  }

  formAction(): void {
    if (this.events) {
      this.pageService.formAction(this.events);
    }
  }

  private init(): void {
    if (this.link.text) {
      this.text = this.link.text;
      if (this.text && this.text.value) {
        this.linkText = this.text.value.trim();
      }
    }

    this.events = this.link.attributes.events;
    this.ready = true;
  }
}
