import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeForm } from '../../model/xmlns/content/content-ct-form';
import { KgwContentComplexTypeParagraph } from '../../model/xmlns/content/content-ct-paragraph';
import { KgwContentComplexTypeTextchild } from '../../model/xmlns/content/content-ct-text-child';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { KgwTractComplexTypeCard } from '../../model/xmlns/tract/tract-ct-card';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-page-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnChanges {
  @Input() card: KgwTractComplexTypeCard;
  @Input() cardIndex: number;

  ready: boolean;
  label: KgwContentComplexTypeTextchild;
  labelText: string;
  content: Array<KgwContentElementItem>;
  dir$: Observable<string>;
  isForm$: Observable<boolean>;
  isModal$: Observable<boolean>;
  isFirstPage$: Observable<boolean>;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
    this.isModal$ = this.pageService.isModal$;
    this.isFirstPage$ = this.pageService.isFirstPage$;
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'card': {
            if (
              !changes['card'].previousValue ||
              changes['card'].currentValue !== changes['card'].previousValue
            ) {
              this.ready = false;
              this.label = null;
              this.labelText = '';
              this.content = [];
              this.init();
            }
          }
        }
      }
    }
  }

  trackByFn(index, item) {
    return index;
  }

  private init(): void {
    if (this.card.label) {
      this.label = this.card.label;
      this.labelText =
        this.label.text && this.label.text.value
          ? this.label.text.value.trim()
          : '';
    }
    if (this.card.content && this.card.content.length) {
      this.card.content.forEach((contentChild) => {
        if (contentChild.contentType === 'paragraph') {
          const tParagraph: KgwContentComplexTypeParagraph =
            contentChild as KgwContentComplexTypeParagraph;
          if (
            !this.pageService.isRestricted(tParagraph.attributes.restrictTo)
          ) {
            const tItemToAdd: KgwContentElementItem = {
              type: 'paragraph',
              element: tParagraph,
            };
            this.content.push(tItemToAdd);
          }
        } else if (contentChild.contentType === 'form') {
          const tForm: KgwContentComplexTypeForm =
            contentChild as KgwContentComplexTypeForm;
          const tItemToAdd: KgwContentElementItem = {
            type: 'form',
            element: tForm,
          };
          this.content.push(tItemToAdd);
        }
      });
    }
    this.ready = true;
  }
}
