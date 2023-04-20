import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { KgwContentComplexTypeText } from '../../model/xmlns/content/content-ct-text';
import { KgwTractComplexTypeCallToAction } from '../../model/xmlns/tract/tract-ct-call-to-action';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-page-calltoaction',
  templateUrl: './calltoaction.component.html',
  styleUrls: ['./calltoaction.component.css']
})
export class CalltoactionComponent implements OnChanges {
  @Input() item: KgwTractComplexTypeCallToAction;

  text: KgwContentComplexTypeText;
  ready: boolean;
  actionText: string;
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
              this.actionText = '';
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    if (this.item.text) {
      this.text = this.item.text;
      if (this.text && this.text.value) {
        this.actionText = this.text.value.trim().replace(/<br\s*[\/]?>/gi, ' ');
      }
    }
    this.ready = true;
  }
}
