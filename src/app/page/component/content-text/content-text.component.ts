import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeText } from '../../model/xmlns/content/content-ct-text';
import { KgwContentElementItem } from '../../model/xmlns/content/content-element';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-text',
  templateUrl: './content-text.component.html',
  styleUrls: ['./content-text.component.css'],
})
export class ContentTextComponent implements OnChanges {
  @Input() item: KgwContentElementItem;

  text: KgwContentComplexTypeText;
  ready: boolean;
  textValue: string;
  isFirstPage$: Observable<boolean>;
  dir$: Observable<string>;

  constructor(private pageService: PageService) {
    this.isFirstPage$ = pageService.isFirstPage$;
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
              this.textValue = '';
              this.text = this.item.element as KgwContentComplexTypeText;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.textValue = this.text && this.text.value ? this.text.value.trim() : '';
    this.ready = true;
  }
}
