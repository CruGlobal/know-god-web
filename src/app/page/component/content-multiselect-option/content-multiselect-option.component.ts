import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  Content,
  FlowWatcher,
  MultiselectOption
} from 'src/app/services/xml-parser-service/xmp-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-new-multiselect-option',
  templateUrl: './content-multiselect-option.component.html',
  styleUrls: ['./content-multiselect-option.component.css']
})
export class ContentMultiselectOptionComponent implements OnChanges {
  @Input() item: MultiselectOption;
  option: MultiselectOption;
  contents: Content[];
  selected: boolean;
  ready: boolean;
  state: any;
  selectedWatcher: FlowWatcher;

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
              this.option = this.item;
              this.init();
            }
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.selectedWatcher) this.selectedWatcher.close();
  }

  onClick() {
    this.option.toggleSelected(this.state);
  }

  private init(): void {
    if (this.selectedWatcher) this.selectedWatcher.close();

    this.selectedWatcher = this.option.watchIsSelected(
      this.state,
      (value) => (this.selected = value)
    );
    const contents: Content[] = [];
    this.option.content.forEach((content) =>
      content ? contents.push(content) : null
    );
    this.contents = contents;
    this.ready = true;
  }
}
