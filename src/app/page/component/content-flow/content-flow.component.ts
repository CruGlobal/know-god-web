import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {
  DimensionParser,
  Flow,
  FlowItem,
  Horizontal
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';
import { VisibilityWatchers } from '../visibility-watchers/visibility-watchers';

type FlowContent = {
  item: FlowItem;
  itemWidth?: string | null;
  visibility?: VisibilityWatchers;
};

@Component({
  selector: 'app-content-flow',
  templateUrl: './content-flow.component.html',
  styleUrls: ['./content-flow.component.css']
})
export class ContentFlowComponent implements OnChanges, OnDestroy {
  @Input() item: Flow;

  flow: Flow;
  items: FlowContent[];
  ready: boolean;
  justifyContent: Horizontal;

  constructor(private pageService: PageService) {}

  ngOnDestroy(): void {
    this.closeItemWatchers();
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

  private closeItemWatchers(): void {
    this.items?.forEach((contentItem) =>
      contentItem.visibility?.closeWatchers()
    );
  }

  private init(): void {
    this.closeItemWatchers();

    this.items = this.flow.items.map((flowItem) => {
      const dimension = DimensionParser(flowItem.width);
      const itemWidth = dimension?.value
        ? dimension.value + dimension.symbol
        : null;

      const visibility = new VisibilityWatchers(this.pageService);
      visibility.init(flowItem);

      return {
        item: flowItem,
        itemWidth,
        visibility
      };
    });
    this.justifyContent = this.flow.rowGravity;
    this.ready = true;
  }
}
