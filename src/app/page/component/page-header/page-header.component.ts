import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  Header,
  parseTextAddBrTags
} from 'src/app/services/xml-parser-service/xmp-parser.service';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-page-new-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent implements OnChanges {
  @Input() header: Header;

  private _unsubscribeAll: Subject<any>;

  ready: boolean;
  headerText: string;
  headerNumber: number | null;
  dir$: Observable<string>;
  changeHeader$: Observable<string>;
  isForm$: Observable<boolean>;
  isFirstPage$: Observable<boolean>;

  constructor(private pageService: PageService) {
    this._unsubscribeAll = new Subject<any>();
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
    this.isFirstPage$ = this.pageService.isFirstPage$;
    this.changeHeader$ = this.pageService.changeHeader$;
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'header': {
            if (
              !changes['header'].previousValue ||
              changes['header'].currentValue !== changes['header'].previousValue
            ) {
              this.ready = false;
              this.headerText = '';
              this.headerNumber = null;
              this.init();
            }
          }
        }
      }
    }
  }

  private init(): void {
    const { title, number } = this.header;
    this.headerText = parseTextAddBrTags(title?.text) || '';
    this.headerNumber = number?.text ? Number(number.text) : null;

    this.changeHeader$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((newHeader) => {
        this.headerText = newHeader;
      });

    this.ready = true;
  }
}
