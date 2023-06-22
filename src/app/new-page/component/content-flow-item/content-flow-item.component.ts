import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  Content,
  FlowItem,
  FlowWatcher
} from 'src/app/services/xml-parser-service/xmp-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-new-flow-item',
  templateUrl: './content-flow-item.component.html',
  styleUrls: ['./content-flow-item.component.css']
})
export class ContentFlowItemNewComponent implements OnChanges {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() item: FlowItem;
  contents: Content[];
  ready: boolean;
  state: any;
  isHidden: boolean;
  isHiddenWatcher: FlowWatcher;

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
              this.init();
            }
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.isHiddenWatcher.close();
  }

  private init(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();

    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );
    const contents: Content[] = [];
    this.item.content.forEach((content) =>
      content ? contents.push(content) : null
    );
    this.contents = contents;
    this.ready = true;
  }
}
