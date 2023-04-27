import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeAccordion } from '../../model/xmlns/content/content-ct-accordion';
import { KgwContentComplexTypeAccordionSection } from '../../model/xmlns/content/content-ct-accordion-section';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';
import { ContentItems } from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-content-new-accordion',
  templateUrl: './content-accordion.component.html',
  styleUrls: ['./content-accordion.component.css']
})
export class ContentAccordionNewComponent implements OnChanges {
  @Input() item: ContentItems;

  accordion: KgwContentComplexTypeAccordion;
  sections: Array<KgwContentComplexTypeAccordionSection>;
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
              this.accordion = this.item as KgwContentComplexTypeAccordion;
              this.sections = [];
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    if (this.accordion.sections && this.accordion.sections.length) {
      this.accordion.sections.forEach((section) => {
        this.sections.push(section);
      });
    }
    this.ready = true;
  }
}
