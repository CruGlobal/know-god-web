import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeSpacer } from '../../model/xmlns/content/content-ct-spacer';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-new-spacer',
  templateUrl: './content-spacer.component.html',
  styleUrls: ['./content-spacer.component.css']
})
export class ContentSpacerNewComponent implements OnChanges {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() item: KgwContentElementItem;

  spacer: KgwContentComplexTypeSpacer;
  ready: boolean;
  mode: string;
  height: number;
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
              this.mode = '';
              this.height = 0;
              this.spacer = this.item.element as KgwContentComplexTypeSpacer;
              this.ready = false;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.mode = this.spacer.attributes.mode;
    this.height = this.spacer.attributes.height;
    this.ready = true;
  }
}
