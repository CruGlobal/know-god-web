import {
  Component,
  HostListener,
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
import { navigateBackIfPossible, shouldShowBackButton } from '../page-helpers';

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
  @Input() setCardUrl: (card: number) => void;

  readonly _unsubscribeAll: Subject<void>;
  private _page: CyoaCardCollectionPage;
  cards: CYOAPageCard[];
  ready: boolean;
  dir$: Observable<string>;
  formAction$: Observable<string>;
  isForm$: Observable<boolean>;
  isModal$: Observable<boolean>;
  currentYear = new Date().getFullYear();
  totalCards: number;
  showBackButton: boolean;
  currentCardIndex: number = 0;

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

  get currentCard(): CYOAPageCard | undefined {
    return this.cards?.[this.currentCardIndex];
  }

  goToCard(index: number): void {
    if (!this.cards?.length) {
      return;
    }
    const safeIndex = Math.max(0, Math.min(index, this.cards.length - 1));

    if (safeIndex !== this.currentCardIndex) {
      this.currentCardIndex = safeIndex;
      this.setCardUrl(safeIndex);
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' && !this.isFirstCard()) {
      this.showPreviousCard();
    } else if (event.key === 'ArrowRight' && !this.isLastCard()) {
      this.showNextCard();
    }
  }

  showPreviousCard(): void {
    this.goToCard(this.currentCardIndex - 1);
  }

  showNextCard(): void {
    this.goToCard(this.currentCardIndex + 1);
  }

  isFirstCard(): boolean {
    return this.currentCardIndex === 0;
  }
  isLastCard(): boolean {
    return this.currentCardIndex === this.totalCards - 1;
  }

  private onCardPositionChange(): void {
    this.route.paramMap
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((params: ParamMap) => {
        const param = params.get('cardPosition');
        const index = parseInt(param, 10);
        if (isNaN(index) || index < 0) {
          this.setCardUrl(0);
        } else {
          this.goToCard(index);
        }
      });
  }

  private init(): void {
    this.pageService.setPageOrder(this.order, this.totalPages);
    this.pageService.modalHidden();
    this.pageService.formHidden();
    this.cards = this._page.cards;
    this.totalCards = this.cards.length;
    this.showBackButton = shouldShowBackButton(this._page);
    this.onCardPositionChange();

    this.ready = true;
  }

  navigateBack(): void {
    navigateBackIfPossible(this._page, this.ready, this.showBackButton, (pos) =>
      this.pageService.navigateToPage(pos)
    );
  }
}
