import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { PageService } from '../../service/page-service.service';
import {
  CallToAction,
  Text
} from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-page-new-calltoaction',
  templateUrl: './calltoaction.component.html',
  styleUrls: ['./calltoaction.component.css']
})
export class CalltoactionComponent implements OnChanges {
  @Input() item: CallToAction;

  text: Text;
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
    if (this.item.label) {
      this.text = this.item.label;
      if (this.text && this.item.label.text) {
        this.actionText = this.item.label.text
          .trim()
          .replace(/<br\s*[\/]?>/gi, ' ');
      }
    }
    this.ready = true;
  }
}
