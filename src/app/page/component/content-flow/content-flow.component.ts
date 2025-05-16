import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  DimensionParser,
  Flow,
  FlowItem,
  Horizontal
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-flow',
  templateUrl: './content-flow.component.html',
  styleUrls: ['./content-flow.component.css']
})
export class ContentFlowComponent implements OnChanges {
  @Input() item: Flow;

  flow: Flow;
  items: (FlowItem & { itemWidth?: string | null })[];
  ready: boolean;
  state: any;
  justifyContent: Horizontal;

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
    this.items = this.item.items;
    this.items.forEach((flowItem) => {
      const dimension = DimensionParser(flowItem.width);
      flowItem.itemWidth = dimension?.value
        ? dimension.value + dimension.symbol
        : null;
    });
    this.justifyContent = this.item.rowGravity;
    this.ready = true;
  }
}
