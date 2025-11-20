import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import {
  FlowWatcher,
  Multiselect,
  MultiselectOption
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-multiselect',
  templateUrl: './content-multiselect.component.html',
  styleUrls: ['./content-multiselect.component.css']
})
export class ContentMultiselectComponent implements OnChanges, OnDestroy {
  @Input() item: Multiselect;

  multiselect: Multiselect;
  options: MultiselectOption[];
  columns: number;
  ready: boolean;
  state: any;
  isHidden: boolean;
  isHiddenWatcher: FlowWatcher;

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
    // Initialize visibility watcher
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();

    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    this.columns = this.multiselect.columns || null;
    this.options = this.multiselect.options;
    this.ready = true;
  }
}
