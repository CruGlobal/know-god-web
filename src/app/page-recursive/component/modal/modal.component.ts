import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeParagraph } from '../../model/xmlns/content/content-ct-paragraph';
import { KgwContentComplexTypeTextchild } from '../../model/xmlns/content/content-ct-text-child';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { KgwTractComplexTypeModal } from '../../model/xmlns/tract/tract-ct-modal';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-page-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnChanges {

  @Input('modal') modal : KgwTractComplexTypeModal;
  
  ready: boolean;
  title: KgwContentComplexTypeTextchild;
  content: Array<KgwContentElementItem>;
  titleText: string;
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
          case 'modal': {
            if (!changes['modal'].previousValue || changes['modal'].currentValue !== changes['modal'].previousValue) {
              this.ready = false;
              this.title = null;
              this.titleText = '';
              this.content = [];
              setTimeout(() => { this.init(); }, 0);
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
    if (this.modal.title) {
      this.title = this.modal.title;
      this.titleText = this.title.text && this.title.text.value ? this.title.text.value.trim() : '';
    }

    if (this.modal.content && this.modal.content.length) {
      this.modal.content.forEach(
        contentChild => {
          if (contentChild.contentType === 'paragraph') {
            var tParagraph: KgwContentComplexTypeParagraph = contentChild as KgwContentComplexTypeParagraph;
            if (!this.pageService.isRestricted(tParagraph.attributes.restrictTo)) {
              let tItemToAdd: KgwContentElementItem = {
                type: 'paragraph',
                element: tParagraph
              };
              this.content.push(tItemToAdd);
            }
          }
        }
      );
    }

    this.ready = true;
  }
}
