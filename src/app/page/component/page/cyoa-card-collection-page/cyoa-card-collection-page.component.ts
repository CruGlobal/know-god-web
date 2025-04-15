import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CYOAPageCard,
  Content,
  CyoaCardCollectionPage
} from 'src/app/services/xml-parser-service/xmp-parser.service';
import { PageService } from '../../../service/page-service.service';

@Component({
  selector: 'app-cyoa-card-collection-page',
  templateUrl: './cyoa-card-collection-page.component.html',
  styleUrls: ['../default-page.css'],
  encapsulation: ViewEncapsulation.None
})
export class CYOACardCollectionComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() page: CyoaCardCollectionPage;
  @Input() order: number;
  @Input() totalPages: number;

  readonly _unsubscribeAll: Subject<void>;
  private _page: CyoaCardCollectionPage;
  cards: CYOAPageCard[];
  content: Content[];
  ready: boolean;
  dir$: Observable<string>;
  formAction$: Observable<string>;
  isForm$: Observable<boolean>;
  isModal$: Observable<boolean>;
  currentYear = new Date().getFullYear();
  isLastCard: boolean;
  isFirstCard: boolean;
  totalCards: number;

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

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((params: ParamMap) => {
        const index = parseInt(params.get('cardPosition'), 10);
        this.currentCardIndex =
          !isNaN(index) && index >= 0 && index < this.cards?.length ? index : 0;

        this.updateCardState();
      });
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

  showPreviousCard(): void {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.updateUrl();
      this.updateCardState();
    }
  }

  showNextCard(): void {
    if (this.currentCardIndex < this.cards.length - 1) {
      this.currentCardIndex++;
      this.updateUrl();
      this.updateCardState();
    }
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

  private init(): void {
    console.log('CYOA Card Collection Page:', this._page);
    console.log('Order:', this.order);
    console.log('Total Pages:', this.totalPages);
    this.pageService.setPageOrder(this.order, this.totalPages);
    this.pageService.modalHidden();
    this.pageService.formHidden();
    this.cards = this._page.cards;
    this.totalCards = this.cards.length || 0;

    this.ready = true;
  }
}
