import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CYOAPageCard,
  CyoaCardCollectionPage
} from 'src/app/services/xml-parser-service/xmp-parser.service';
import { PageService } from '../../../service/page-service.service';

@Component({
  selector: 'app-cyoa-card-collection-page',
  templateUrl: './cyoa-card-collection-page.component.html',
  styleUrls: ['../default-page.css'],
  encapsulation: ViewEncapsulation.None
})
export class CYOACardCollectionComponent implements OnChanges, OnDestroy {
  @Input() page: CyoaCardCollectionPage;
  @Input() order: number;
  @Input() totalPages: number;

  readonly _unsubscribeAll: Subject<void>;
  private _page: CyoaCardCollectionPage;
  cards: CYOAPageCard[];
  ready: boolean;
  dir$: Observable<string>;
  formAction$: Observable<string>;
  isForm$: Observable<boolean>;
  isModal$: Observable<boolean>;
  currentYear = new Date().getFullYear();
  isLastCard: boolean;
  isFirstCard: boolean;
  totalCards: number;
  showBackButton: boolean;

  constructor(
    readonly pageService: PageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this._unsubscribeAll = new Subject<void>();
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
    this.isModal$ = this.pageService.isModal$;
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
  currentCardIndex = 0;

  get currentCard(): CYOAPageCard | undefined {
    return this.cards?.[this.currentCardIndex];
  }

  goToCard(index: number): void {
    if (!this.cards || this.cards.length === 0) return;

    const safeIndex = Math.max(0, Math.min(index, this.cards.length - 1));

    if (safeIndex !== this.currentCardIndex) {
      this.currentCardIndex = safeIndex;
      this.updateUrl();
      this.updateCardState();
    }
  }

  showPreviousCard(): void {
    this.goToCard(this.currentCardIndex - 1);
  }

  showNextCard(): void {
    this.goToCard(this.currentCardIndex + 1);
  }

  private updateUrl(): void {
    this.router.navigate(['../', this.currentCardIndex], {
      relativeTo: this.route
    });
  }

  private updateCardState(): void {
    this.isFirstCard = this.currentCardIndex === 0;
    this.isLastCard = this.currentCardIndex === this.totalCards - 1;
  }

  private subscribeToCardPosition(): void {
    this.route.paramMap
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((params: ParamMap) => {
        const param = params.get('cardPosition');
        const index = parseInt(param, 10);

        if (param === null || isNaN(index) || index < 0) {
          this.router.navigate([0], {
            relativeTo: this.route,
            replaceUrl: true
          });
        } else {
          this.goToCard(index);
        }
      });
  }

  private init(): void {
    console.log('CYOA Card Collection Page:', this._page);
    console.log('Order:', this.order);
    console.log('Total Pages:', this.totalPages);
    this.pageService.setPageOrder(this.order, this.totalPages);
    this.pageService.modalHidden();
    this.pageService.formHidden();
    this.cards = this._page.cards;
    this.totalCards = this.cards.length || 0;
    this.showBackButton = !!this._page.parentPage?.position;
    this.subscribeToCardPosition();

    this.ready = true;
  }

  navigateBack(): void {
    if (!this.ready || !this.showBackButton) {
      return;
    }

    this.pageService.navigateToPage(this._page.parentPage.position);
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
