import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {
  Multiselect,
  MultiselectOption
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';
import { VisibilityWatchers } from '../visibility-watchers/visibility-watchers';

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
  visibility: VisibilityWatchers;

  constructor(private pageService: PageService) {
    this.visibility = new VisibilityWatchers(this.pageService);
  }

  ngOnDestroy(): void {
    this.visibility.closeWatchers();
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
    this.visibility.init(this.multiselect);

    this.columns = this.multiselect.columns || null;
    this.options = this.multiselect.options;
    this.ready = true;
  }
}
