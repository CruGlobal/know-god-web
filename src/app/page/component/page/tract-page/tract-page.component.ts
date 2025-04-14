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
  CallToAction,
  Content,
  EventId,
  Header,
  Hero,
  Modal,
  TractPage,
  TractPageCard
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { PageService } from '../../../service/page-service.service';

@Component({
  selector: 'app-tract-new-page',
  templateUrl: './tract-page.component.html',
  styleUrls: ['../default-page.css'],
  encapsulation: ViewEncapsulation.None
})
export class TractPageComponent implements OnChanges, OnDestroy {
  @Input() page: TractPage;
  @Input() order: number;
  @Input() totalPages: number;

  private _unsubscribeAll: Subject<void>;
  private _page: TractPage & { content?: Content };
  private _cardShownOnFormAction = -1;
  private _cardsHiddenOnFormAction: number[] = [];

  header: Header;
  hero: Hero;
  content: Content;
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
              this.content = null;
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

    // Check if form submission
    if (inputFunctionName.toLowerCase().indexOf('followup:send') !== -1) {
      this.pageService.emailSignumFormDataNeeded();
      setTimeout(() => {
        this.onFormAction(functionName);
      }, 0);
      return;
    }

    // Check if we should hide or show cards
    if (this.cards.length) {
      const cardListener = this.cards.find((card) => {
        return card.listeners
          ? card.listeners.find((listener) => listener.name === functionName)
          : null;
      });
      if (cardListener) {
        this._cardShownOnFormAction = cardListener.position;
        isShowCard = true;
      }

      const cardDismissListener = this.cards.find((card) => {
        return card.dismissListeners
          ? card.dismissListeners.find(
              (dismissListener) => dismissListener.name === functionName
            )
          : null;
      });
      if (cardDismissListener) {
        isHideCard = true;
      }
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
    }

    if (isShowCard) {
      const card_to_show = this.cards[this._cardShownOnFormAction];
      card_to_show.isTemporarilyHidden = false;
      this.pageService.formVisible();
      this.pageService.modalHidden();

      if (card_to_show.label?.text) {
        this.pageService.changeHeader(card_to_show.label.text);
      }

      // Hide all other cards that are not listeners of the current event.
      this.cards.forEach((card) => {
        const shouldHideCard = !card.listeners?.some(
          (listener) => listener.name === functionName
        );
        if (shouldHideCard) {
          card.isTemporarilyHidden = true;
          if (!this._cardsHiddenOnFormAction.includes(card.position)) {
            this._cardsHiddenOnFormAction.push(card.position);
          }
        }
      });
    } else if (isHideCard) {
      setTimeout(() => {
        this.pageService.formHidden();
        this.pageService.modalHidden();
        if (this._cardsHiddenOnFormAction.length) {
          this.setHiddenCardToShow();
        }
        if (this._cardShownOnFormAction >= 0) {
          this.setShownCardToHidden();
        }

        this._cardShownOnFormAction = -1;
        this._cardsHiddenOnFormAction = [];
      }, 0);
    } else if (isShowModal) {
      this.pageService.modalVisible();
      this.pageService.formHidden();
    } else if (isHideModal) {
      this.pageService.modalHidden();
      this.pageService.formHidden();
      setTimeout(() => {
        if (this._cardsHiddenOnFormAction.length) {
          this.setHiddenCardToShow();
        }
        if (this._cardShownOnFormAction >= 0) {
          this.setShownCardToHidden();
        }

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
      .forEach((card) => {
        card.isTemporarilyHidden = false;
      });
  }

  private setShownCardToHidden(): void {
    const card = this.cards.find(
      (card) => card.position === this._cardShownOnFormAction
    );
    if (card) {
      card.isTemporarilyHidden = true;
    }
  }

  private init(): void {
    this.pageService.setPageOrder(this.order, this.totalPages);
    this.pageService.modalHidden();
    this.pageService.formHidden();
    this.header = this._page.header || null;
    this.hasPageHeader = !!this._page.header?.title?.text;
    this.hero = this._page.hero || null;
    this.content = this._page.content || null;
    this.cards = this._page.cards || [];
    this.modal = this._page.modals ? this._page.modals[0] : null;
    this.callToAction = this._page.callToAction?.label?.text
      ? this._page.callToAction
      : null;

    // Reset the property "isTemporarilyHidden" to "isHidden"
    // "isHidden" is the default value from the server
    // "isTemporarilyHidden" changes when a listener is triggered
    this.cards.forEach((card) => {
      card.isTemporarilyHidden = card.isHidden;
    });
    this.formAction$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((action) => {
        this.onFormAction(action);
      });

    this.ready = true;
  }
}
