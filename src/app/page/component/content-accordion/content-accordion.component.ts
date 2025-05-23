import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Accordion,
  Content
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-accordion',
  templateUrl: './content-accordion.component.html',
  styleUrls: ['./content-accordion.component.css']
})
export class ContentAccordionComponent implements OnChanges {
  @Input() item: Accordion;

  accordion: Accordion;
  sections: any[];
  ready: boolean;
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
              this.accordion = this.item;
              this.sections = [];
              this.init();
            }
          }
        }
      }
    }
  }

  onClick(event: any) {
    const parent = event.target.classList.contains('far')
      ? event.target.parentElement.parentElement
      : event.target.parentElement;
    const hasActiveClass = parent.classList.contains('active');
    if (hasActiveClass) {
      parent.classList.remove('active');
    } else {
      parent.classList.add('active');
    }
  }

  private init(): void {
    this.item.sections.forEach((section) => {
      const contents: Content[] = [];
      if (section.content) {
        section.content.forEach((content) =>
          content ? contents.push(content) : null
        );
      }
      this.sections.push({ section, contents });
    });

    this.ready = true;
  }
}
