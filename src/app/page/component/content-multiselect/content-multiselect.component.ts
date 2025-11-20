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
  isInvisible: boolean;
  isHiddenWatcher: FlowWatcher;
  isInvisibleWatcher: FlowWatcher;

  constructor(private pageService: PageService) {
    this.state = this.pageService.parserState();
  }

  ngOnDestroy(): void {
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();
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
    // Initialize visibility watchers
    if (this.isHiddenWatcher) this.isHiddenWatcher.close();
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();

    // Watch for gone-if expressions (removes from DOM)
    this.isHiddenWatcher = this.item.watchIsGone(
      this.state,
      (value) => (this.isHidden = value)
    );

    // Watch for invisible-if expressions (hides but keeps space)
    this.isInvisibleWatcher = this.item.watchIsInvisible(
      this.state,
      (value) => (this.isInvisible = value)
    );

    this.columns = this.multiselect.columns || null;
    this.options = this.multiselect.options;
    this.ready = true;
  }
}
