import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { Spacer } from 'src/app/services/xml-parser-service/xmp-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-spacer',
  templateUrl: './content-spacer.component.html',
  styleUrls: ['./content-spacer.component.css']
})
export class ContentSpacerComponent implements OnChanges {
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
              this.mode = this.item.mode.name;
              this.height = this.item.height;
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
