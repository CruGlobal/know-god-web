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
  CYOAPage,
  CYOAPageCard,
  Content
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../../service/page-service.service';
import { navigateBackIfPossible, shouldShowBackButton } from '../page-helpers';

@Component({
  selector: 'app-cyoa-page',
  templateUrl: './cyoa-page.component.html',
  styleUrls: ['./cyoa-page.component.css', '../default-page.css'],
  encapsulation: ViewEncapsulation.None
})
export class CYOAComponent implements OnChanges, OnDestroy {
  @Input() page: CYOAPage;
  @Input() order: number;
  @Input() totalPages: number;

  readonly _unsubscribeAll: Subject<void>;
  private _page: CYOAPage;
  cards: CYOAPageCard[];
  content: Content[];
  ready: boolean;
  dir$: Observable<string>;
  formAction$: Observable<string>;
  isForm$: Observable<boolean>;
  isModal$: Observable<boolean>;
  isFirstPage$: Observable<boolean>;
  isLastPage$: Observable<boolean>;
  currentYear = new Date().getFullYear();
  showBackButton: boolean;

  constructor(readonly pageService: PageService) {
    this._unsubscribeAll = new Subject<void>();
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
    this.isModal$ = this.pageService.isModal$;
    this.isFirstPage$ = this.pageService.isFirstPage$;
    this.isLastPage$ = this.pageService.isLastPage$;
    this.formAction$ = this.pageService.formAction$;
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
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
              this.cards = [];
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
    this.pageService
      .getNavigationStack()
      .subscribe((stack) => console.log('Nav stack', stack));
    this.pageService.setPageOrder(this.order, this.totalPages);
    this.pageService.modalHidden();
    this.pageService.formHidden();

    this.pageService.ensureParentPageIsInNavigationStack(
      this._page.parentPage?.position
    );
    this.pageService.ensurePageIsLatestInNavigationStack(this._page.position);

    if ('content' in this._page) {
      this.content = this._page.content;
    }

    this.formAction$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((action) => {
        this.onFormAction(action);
      });

    this.ready = true;

    this.showBackButton = shouldShowBackButton(this._page);
  }

  navigateBack(): void {
    navigateBackIfPossible(this._page, this.ready, this.showBackButton, (pos) =>
      this.pageService.navigateToPage(pos)
    );
  }

  private onFormAction(inputFunctionName: string): void {
    let functionName = inputFunctionName;

    if (functionName.indexOf(' ') > -1) {
      const splitname = functionName.split(' ');
      functionName =
        splitname[0].indexOf(':') > -1 ? splitname[1].trim() : splitname[0];
    }

    // Check if form submission
    if (inputFunctionName.toLowerCase().indexOf('followup:send') !== -1) {
      this.pageService.emailSignumFormDataNeeded();
      setTimeout(() => {
        this.onFormAction(functionName);
      }, 0);
      return;
    }

    console.log('Function Name:', functionName);
  }
}
