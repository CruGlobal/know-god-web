import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  Accordion,
  AccordionSection,
  Content
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';
import { VisibilityWatchers } from '../visibility-watchers/visibility-watchers';

interface AccordionSectionWithContent {
  section: AccordionSection;
  contents: Content[];
}

@Component({
  selector: 'app-content-accordion',
  templateUrl: './content-accordion.component.html',
  styleUrls: ['./content-accordion.component.css']
})
export class ContentAccordionComponent implements OnChanges, OnDestroy {
  @Input() item: Accordion;

  accordion: Accordion;
  sections: AccordionSectionWithContent[];
  ready: boolean;
  dir$: Observable<string>;
  visibility: VisibilityWatchers;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.visibility = new VisibilityWatchers(this.pageService);
  }

  ngOnDestroy(): void {
    this.visibility.closeWatchers();
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

  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const parent = target.classList.contains('far')
      ? target.parentElement.parentElement
      : target.parentElement;
    const hasActiveClass = parent.classList.contains('active');
    if (hasActiveClass) {
      parent.classList.remove('active');
    } else {
      parent.classList.add('active');
    }
  }

  private init(): void {
    this.visibility.init(this.item);

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
