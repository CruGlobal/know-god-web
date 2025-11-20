import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import {
  Content,
  FlowWatcher,
  Paragraph
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-paragraph',
  templateUrl: './content-paragraph.component.html',
  styleUrls: ['./content-paragraph.component.css']
})
export class ContentParagraphComponent implements OnChanges, OnDestroy {
  @Input() item: Paragraph;

  paragraph: Paragraph;
  ready: boolean;
  items: Array<Content>;
  isHidden: boolean;
  isHiddenWatcher: FlowWatcher;
  state: any;

  constructor(private pageService: PageService) {
    this.state = this.pageService.parserState();
  }

  ngOnDestroy(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
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
              this.items = [];
              this.paragraph = this.item;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    // Initialize visibility watcher
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();

    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    this.items = this.paragraph.content;
    this.ready = true;
  }
}
