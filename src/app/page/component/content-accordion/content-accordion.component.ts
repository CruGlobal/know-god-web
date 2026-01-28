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
  Content,
  FlowWatcher,
  ParserState
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

interface AccordionSectionWithContent {
  section: Accordion['Section'];
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
