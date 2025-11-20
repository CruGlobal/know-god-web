import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { Spacer, FlowWatcher } from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-content-spacer',
  templateUrl: './content-spacer.component.html',
  styleUrls: ['./content-spacer.component.css']
})
export class ContentSpacerComponent implements OnChanges, OnDestroy {
  @Input() item: Spacer;

  spacer: Spacer;
  ready: boolean;
  mode: string;
  height: number;
  dir$: Observable<string>;
  isHidden: boolean;
  isHiddenWatcher: FlowWatcher;
  state: any;

  constructor(private pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
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
              this.mode = this.item.mode.name;
              this.height = this.item.height;
              this.spacer = this.item;
              this.ready = false;
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

    this.mode = this.spacer.mode.name;
    this.height = this.spacer.height;
    this.ready = true;
  }
}
