import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KgwTractComplexTypePageHeader } from '../../model/xmlns/tract/tract-ct-page-header';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent implements OnInit, OnChanges {

  @Input('header') header : KgwTractComplexTypePageHeader;
  
  private _unsubscribeAll: Subject<any>;

  ready: boolean;
  headerText: string;
  dir$: Observable<string>;
  changeHeader$: Observable<string>;
  isForm$: Observable<boolean>;
  isFirstPage$: Observable<boolean>;

  constructor(
    private pageService: PageService
  ) {
    this._unsubscribeAll = new Subject<any>();
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
    this.isFirstPage$ = this.pageService.isFirstPage$;
    this.changeHeader$ = this.pageService.changeHeader$;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'header': {
            if (!changes['header'].previousValue || changes['header'].currentValue !== changes['header'].previousValue) {
              this.ready = false;
              this.headerText = "";
              setTimeout(() => { this.init(); }, 0);
            }
          }
        }
      }
    }
  }

  private init(): void {
    if (this.header && this.header.title && this.header.title.text && this.header.title.text.value) {
      this.headerText = this.header.title.text.value;
    }

    this.changeHeader$
      .pipe(
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(
        newHeader => {
          this.headerText = newHeader;
        }
      );

    this.ready = true;
  }
}
