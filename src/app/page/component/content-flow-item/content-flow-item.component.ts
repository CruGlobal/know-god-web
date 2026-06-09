import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {
  Content,
  FlowItem
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';
import { VisibilityWatchers } from '../visibility-watchers/visibility-watchers';

@Component({
  selector: 'app-content-flow-item',
  templateUrl: './content-flow-item.component.html',
  styleUrls: ['./content-flow-item.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ContentFlowItemComponent implements OnChanges, OnDestroy {
  @Input() item: FlowItem;
  contents: Content[];
  ready: boolean;
  visibility: VisibilityWatchers;

  constructor(private pageService: PageService) {
    this.visibility = new VisibilityWatchers(this.pageService);
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
              this.init();
            }
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.visibility.closeWatchers();
  }

  private init(): void {
    this.visibility.init(this.item);

    const contents: Content[] = [];
    this.item.content.forEach((content) =>
      content ? contents.push(content) : null
    );
    this.contents = contents;
    this.ready = true;
  }
}
