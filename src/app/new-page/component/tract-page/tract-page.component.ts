import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageService } from '../../service/page-service.service';
import {
  TractPage,
  Modal,
  TractPageCard,
  Hero,
  Header,
  CallToAction,
  EventId
} from 'src/app/services/xml-parser-service/xmp-parser.service';

@Component({
  selector: 'app-tract-new-page',
  templateUrl: './tract-page.component.html',
  styleUrls: ['./tract-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TractPageNewComponent implements OnChanges, OnDestroy {
  @Input() page: TractPage;
  @Input() order: number;
  @Input() totalPages: number;

  private _unsubscribeAll: Subject<any>;
  private _page: TractPage;
  private _cardShownOnFormAction = -1;
  private _cardsHiddenOnFormAction: number[] = [];

  header: Header;
  hero: Hero;
  cards: TractPageCard[];
  modal: Modal;
  callToAction: CallToAction;
  ready: boolean;
  hasPageHeader: boolean;
  dir$: Observable<string>;
  formAction$: Observable<string>;
  isForm$: Observable<boolean>;
  isModal$: Observable<boolean>;
  isFirstPage$: Observable<boolean>;
  isLastPage$: Observable<boolean>;
  currentYear = new Date().getFullYear();

  constructor(private pageService: PageService) {
    this._unsubscribeAll = new Subject<any>();
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
              this.header = null;
              this.hero = null;
              this.cards = [];
              this.modal = null;
              this.callToAction = null;
              this.hasPageHeader = false;
              this.init();
            }
            break;
          default:
            break;
        }
      }
    }
  }

  private onFormAction(inputFunctionName: string): void {
    let functionName = inputFunctionName;

    if (functionName.indexOf(' ') > -1) {
      const splitname = functionName.split(' ');
      functionName =
        splitname[0].indexOf(':') > -1 ? splitname[1].trim() : splitname[0];
    }

    let isShowCard: boolean;
    let isHideCard: boolean;
    let isShowModal: boolean;
    let isHideModal: boolean;

    if (inputFunctionName.toLowerCase().indexOf('followup:send') !== -1) {
      this.pageService.emailSignumFormDataNeeded();
      setTimeout(() => {
        this.onFormAction(functionName);
      }, 0);
      return;
    } else {
      if (functionName.includes('-no-thanks')) {
        let isFirstPage = false;
        let isLastPage = true;
        this.isFirstPage$.subscribe((value) => {
          isFirstPage = value;
        });
        this.isLastPage$.subscribe((value) => {
          isLastPage = value;
        });

        if (!isLastPage) {
          this.pageService.nextPage();
        } else if (!isFirstPage) {
          this.pageService.previousPage();
        }
        return;
      }

      if (this.cards.length) {
        const cardListener = this.cards.find((card) =>
          card.listeners
            ? card.listeners.find((listener) => listener.name === functionName)
            : null
        );
        if (cardListener) {
          this._cardShownOnFormAction = cardListener.position;
          isShowCard = true;
        }

        const cardDismissListener = this.cards.find((card) =>
          card.dismissListeners
            ? card.dismissListeners.find(
                (dismissListener) => dismissListener.name === functionName
              )
            : null
        );
        if (cardDismissListener) isHideCard = true;
      }
      if (!isShowCard && !isHideCard && this.modal) {
        const listeners = this.modal.listeners as EventId[];
        const dismissListeners = this.modal.dismissListeners as EventId[];
        isShowModal = !!listeners.filter(
          (listener) => listener.name === functionName
        )?.length;
        isHideModal = !!dismissListeners.filter(
          (dismissListener) => dismissListener.name === functionName
        )?.length;
        listeners.forEach((l) => {});
        dismissListeners.forEach((l) => {});
      }
    }

    if (isShowCard) {
      // Set type as Any so we can edit isHidden property.
      const card_to_show = this.cards[this._cardShownOnFormAction];
      (card_to_show as any).isHidden = false;
      this.pageService.formVisible();
      this.pageService.modalHidden();

      if (card_to_show.label?.text) {
        this.pageService.changeHeader(card_to_show.label.text);
      }

      this.cards.forEach((card) => {
        if (card.listeners?.length) {
          card.listeners.forEach((listener) => {
            if (!card.isHidden && listener.name !== functionName) {
              this._cardsHiddenOnFormAction.push(card.position);
            }
          });
        } else {
          this._cardsHiddenOnFormAction.push(card.position);
        }
      });

      if (this._cardsHiddenOnFormAction.length) {
        this.cards
          .filter((card) =>
            this._cardsHiddenOnFormAction.includes(card.position)
          )
          .map((card) => {
            (card as any).isHidden = true;
          });
      }
    } else if (isHideCard) {
      this.next();
      setTimeout(() => {
        this.pageService.formHidden();
        this.pageService.modalHidden();
        if (this._cardsHiddenOnFormAction.length) this.setHiddenCardToShow();
        if (this._cardShownOnFormAction >= 0) this.setShownCardToHidden();

        this._cardShownOnFormAction = -1;
        this._cardsHiddenOnFormAction = [];
      }, 0);
    } else if (isShowModal) {
      this.pageService.modalVisible();
      this.pageService.formHidden();
    } else if (isHideModal) {
      this.pageService.modalHidden();
      this.pageService.formHidden();
      this.next();
      setTimeout(() => {
        if (this._cardsHiddenOnFormAction.length) this.setHiddenCardToShow();
        if (this._cardShownOnFormAction >= 0) this.setShownCardToHidden();

        this._cardShownOnFormAction = -1;
        this._cardsHiddenOnFormAction = [];
      }, 0);
    } else {
      this.pageService.contentEvent(functionName);
    }
  }

  private setHiddenCardToShow(): void {
    this.cards
      .filter((card) => this._cardsHiddenOnFormAction.includes(card.position))
      .map((card) => {
        (card as any).isHidden = false;
      });
  }

  private setShownCardToHidden(): void {
    (
      this.cards.find(
        (card) => card.position === this._cardShownOnFormAction
      ) as any
    ).isHidden = true;
  }

  private init(): void {
    this.pageService.setPageOrder(this.order, this.totalPages);
    this.pageService.modalHidden();
    this.pageService.formHidden();
    this.header = this._page.header || null;
    this.hasPageHeader = !!this._page.header?.title?.text;
    this.hero = this._page.hero || null;
    this.cards = this._page.cards || [];
    this.modal = this._page.modals ? this._page.modals[0] : null;
    this.callToAction = !!(
      this.page.callToAction?.label?.text || this.page.callToAction?.tip
    )
      ? this.page.callToAction
      : null;

    this.formAction$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((action) => {
        this.onFormAction(action);
      });

    this.ready = true;
  }
}
