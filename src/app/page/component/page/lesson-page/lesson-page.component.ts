import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  Content,
  LessonPage
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../../service/page-service.service';

@Component({
  selector: 'app-lesson-page',
  templateUrl: './lesson-page.component.html',
  styleUrls: ['../default-page.css'],
  encapsulation: ViewEncapsulation.None
})
export class LessonComponent implements OnChanges, OnDestroy {
  @Input() page: LessonPage;
  @Input() order: number;
  @Input() totalPages: number;

  readonly _unsubscribeAll: Subject<void>;
  private _page: LessonPage;

  content: Content[];
  ready: boolean;
  dir$: Observable<string>;
  formAction$: Observable<string>;
  isForm$: Observable<boolean>;
  isModal$: Observable<boolean>;
  isFirstPage$: Observable<boolean>;
  isLastPage$: Observable<boolean>;
  currentYear = new Date().getFullYear();

  constructor(readonly pageService: PageService) {
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
    this.isModal$ = this.pageService.isModal$;
    this.isFirstPage$ = this.pageService.isFirstPage$;
    this.isLastPage$ = this.pageService.isLastPage$;
    this.formAction$ = this.pageService.formAction$;
    this._unsubscribeAll = new Subject();
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  next(): void {
    if (!this.ready) {
      return;
    }
    this.pageService.nextPage();
  }

  previous(): void {
    if (!this.ready) {
      return;
    }
    this.pageService.previousPage();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'page':
            if (
              !changes['page'].previousValue ||
              changes['page'].currentValue !== changes['page'].previousValue
            ) {
              this.ready = false;
              this._page = this.page;
              this.content = [];
              this.init();
            }
            break;
          default:
            break;
        }
      }
    }
  }

  private init(): void {
    // stops form submit behavior of jumping forward
    // multiple pages
    this._unsubscribeAll.next();

    this.pageService.modalHidden();
    this.pageService.formHidden();

    this.pageService.ensureParentPageIsInNavigationStack(
      this._page.parentPage?.id
    );
    this.pageService.ensurePageIsLatestInNavigationStack(this._page.id);

    if (this._page.content) {
      this.content = this._page.content;
    }

    this.formAction$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((action) => {
        this.onFormAction(action);
      });

    this.ready = true;
  }

  private onFormAction(inputFunctionName: string): void {
    const functionName = inputFunctionName.split(' ')[0];

    this.pageService.contentEvent(functionName);
  }
}
