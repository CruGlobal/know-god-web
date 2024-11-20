import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Content,
  Modal,
  Text,
  parseTextAddBrTags
} from 'src/app/services/xml-parser-service/xmp-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-page-new-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnChanges {
  @Input() modal: Modal;

  ready: boolean;
  title: Text;
  content: Content[];
  titleText: string;
  dir$: Observable<string>;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'modal': {
            if (
              !changes['modal'].previousValue ||
              changes['modal'].currentValue !== changes['modal'].previousValue
            ) {
              this.ready = false;
              this.title = null;
              this.titleText = '';
              this.content = [];
              this.init();
            }
          }
        }
      }
    }
  }

  trackByFn(index) {
    return index;
  }

  private init(): void {
    this.title = this.modal?.title || null;
    this.titleText = parseTextAddBrTags(this.title?.text) || '';
    this.content = this.modal.content;
    this.ready = true;
  }
}
