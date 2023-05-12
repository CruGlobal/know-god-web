import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';
import { Modal, Text } from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-page-new-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalNewComponent implements OnChanges {
  @Input() modal: Modal;

  ready: boolean;
  title: Text;
  content: Array<KgwContentElementItem>;
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

  trackByFn(index, item) {
    return index;
  }

  private init(): void {

    this.modal.title.text
    if (this.modal.title) {
      this.title = this.modal.title;
      this.titleText = this.title.text ? this.title.text.trim() : '';
    }
    console.log('this.modal.content', this.modal.content);

    this.ready = true;
  }
}
