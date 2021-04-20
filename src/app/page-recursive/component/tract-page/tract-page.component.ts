import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KgwTractComplexTypeCallToAction } from '../../model/xmlns/tract/tract-ct-call-to-action';
import { KgwTractComplexTypeCard } from '../../model/xmlns/tract/tract-ct-card';
import { KgwTractComplexTypeModal } from '../../model/xmlns/tract/tract-ct-modal';
import { KgwTractComplexTypePage } from '../../model/xmlns/tract/tract-ct-page';
import { KgwTractComplexTypePageHeader } from '../../model/xmlns/tract/tract-ct-page-header';
import { KgwTractComplexTypePageHero } from '../../model/xmlns/tract/tract-ct-page-hero';
import { PageService } from '../../service/page-service.service';

@Component({
  selector: 'app-tract-page',
  templateUrl: './tract-page.component.html',
  styleUrls: ['./tract-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TractPageComponent implements OnInit, OnChanges, OnDestroy {

  @Input('page') page : KgwTractComplexTypePage;
  @Input('order') order : number;
  @Input('totalPages') totalPages : number;

  private _unsubscribeAll: Subject<any>;
  private _page: KgwTractComplexTypePage;

  header: KgwTractComplexTypePageHeader;
  hero: KgwTractComplexTypePageHero;
  cards: KgwTractComplexTypeCard[];
  modals: KgwTractComplexTypeModal[];
  callToAction: KgwTractComplexTypeCallToAction;
  ready: boolean;
  dir$: Observable<string>;
  formAction$: Observable<string>;
  isForm$: Observable<boolean>;
  isModal$: Observable<boolean>;
  isFirstPage$: Observable<boolean>;
  isLastPage$: Observable<boolean>;

  constructor(
    private pageService: PageService
  ) {
    this._unsubscribeAll = new Subject<any>();
    this.dir$ = this.pageService.pageDir$;
    this.isForm$ = this.pageService.isForm$;
    this.isModal$ = this.pageService.isModal$;
    this.isFirstPage$ = this.pageService.isFirstPage$;
    this.isLastPage$ = this.pageService.isLastPage$;
    this.formAction$ = this.pageService.formAction$
  }

  ngOnInit() {
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
            if (!changes['page'].previousValue || changes['page'].currentValue !== changes['page'].previousValue) {
              this._page = this.page;
              this.header = null;
              this.hero = null;
              this.cards = [];
              this.modals = [];
              this.callToAction = null;
              this.ready = false;
              setTimeout(() => { this.init(); }, 0);
            }
            break;
          default:
            break;
        }
      }
    }
  }

  private onFormAction(inputFunctionName:string): void {
    let functionName = inputFunctionName;

    if (functionName.indexOf(' ') > -1) {
      const splitname = functionName.split(' ');
      functionName =
        splitname[0].indexOf(':') > -1 ? splitname[1].trim() : splitname[0];
    }

    console.log("[TRACT COMP]: onFormAction:", functionName);

    if (this.cards && this.cards.length > 0){
      const show_card = this.cards.filter(
        (row) => {
          return row.attributes.listeners && row.attributes.listeners === functionName;
        }
      );

      const hide_card = this.cards.filter(
        (row) => {
          return row.attributes.dismissListeners && row.attributes.dismissListeners === functionName;
        }
      );

      if (show_card.length > 0) {
        const card_to_show = show_card[0];
        card_to_show.attributes.hidden = false;
        this.pageService.formVisible();

        if (card_to_show.label && card_to_show.label.text) {
          this.pageService.changeHeader(
            card_to_show.label.text.value
          );
        }

        const other_cards = this.cards.filter(
          (row) => {
            return !row.attributes.listeners || row.attributes.listeners !== functionName;
          }
        );

        if (other_cards && other_cards.length > 0) {
          other_cards.forEach((card) => {
            card.attributes.hidden = true;
          });
        }
      } else if (hide_card.length > 0) {
        this.next();
      }
    }

    if (this.modals && this.modals.length > 0) {
      const show_modal = this.modals.filter(
        (row) => {
          return row.attributes.listeners && row.attributes.listeners === functionName;
        });

        const hide_modal = this.cards.filter(
          (row) => {
            return row.attributes.dismissListeners && row.attributes.dismissListeners === functionName;
          }
        );

        if (show_modal.length > 0) {
          //this.LoadModal(show_modal[0]);
        } else if (hide_modal.length > 0) {
          this.next();
        }
    }
  }

  private init(): void {
    console.log("[TRACT COMP]: page:", this._page, this.order, this.totalPages);
    this.pageService.setPageOrder(this.order, this.totalPages);
    this.pageService.modalHidden();
    this.pageService.formHidden();
    if (this._page.header) {
      this.header = this._page.header;
    }

    if (this._page.hero) {
      this.hero = this._page.hero;
    }

    if (this.page.cards) {
      this.cards = this.page.cards;
    }

    if (this.page.modals) {
      this.modals = this.page.modals;
    }

    if (this.page.callToAction) {
      this.callToAction = this.page.callToAction;
    }

    this.formAction$
      .pipe(
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(
        action => {
          this.onFormAction(action);
        }
      )

    this.ready = true;
  }

}
