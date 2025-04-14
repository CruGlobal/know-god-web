import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Flow } from 'src/app/services/xml-parser-service/xmp-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-flow',
  templateUrl: './content-flow.component.html',
  styleUrls: ['./content-flow.component.css']
})
export class ContentFlowComponent implements OnChanges {
  @Input() item: Flow;

  flow: Flow;
  items: any[];
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
              this.flow = this.item;
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
    this.items = this.flow.items;
    this.ready = true;
  }
}
