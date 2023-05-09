import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { PageService } from '../../service/page-service.service';
import { Spacer } from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-content-new-spacer',
  templateUrl: './content-spacer.component.html',
  styleUrls: ['./content-spacer.component.css'],
})
export class ContentSpacerNewComponent implements OnChanges {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() item: Spacer;

  spacer: Spacer;
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
              this.spacer = this.item;
              this.ready = false;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    this.mode = this.spacer.mode.name;
    this.height = this.spacer.height;
    this.ready = true;
  }
}
