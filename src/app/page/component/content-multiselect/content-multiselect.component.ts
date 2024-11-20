import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  Multiselect,
  MultiselectOption
} from 'src/app/services/xml-parser-service/xmp-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-new-multiselect',
  templateUrl: './content-multiselect.component.html',
  styleUrls: ['./content-multiselect.component.css']
})
export class ContentMultiselectComponent implements OnChanges {
  @Input() item: Multiselect;

  multiselect: Multiselect;
  options: MultiselectOption[];
  columns: number;
  ready: boolean;
  state: any;

  constructor(private pageService: PageService) {
    this.state = this.pageService.parserState();
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
              this.multiselect = this.item;
              this.options = [];
              this.columns = null;
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
    this.columns = this.multiselect.columns || null;
    this.options = this.multiselect.options;
    this.ready = true;
  }
}
