import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { PageService } from '../../service/page-service.service';
import { Text } from 'src/app/services/xml-parser-service/xmp-parser.service';
@Component({
  selector: 'app-content-new-text',
  templateUrl: './content-text.component.html',
  styleUrls: ['./content-text.component.css']
})
export class ContentTextNewComponent implements OnChanges {
  @Input() item: Text;

  text: Text;
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
              this.text = this.item as Text;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    const text = this.text.text?.trim().replace(/[\n\r]/g, '<br/>');
    this.textValue = text || '';
    this.ready = true;
  }
}
