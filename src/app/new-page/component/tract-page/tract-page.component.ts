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
import { TractPage, Modal, Card, Hero, Header, CallToAction } from 'src/app/services/xml-parser-service/xmp-parser.service';

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
  cards: Card[];
  modal: any;
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
      if (this.cards.length) {
        for (let index = 0; index < this.cards.length; index++) {
          const element = this.cards[index];
          // PIZZA
          // if (
          //   element.attributes.listeners &&
          //   element.attributes.listeners === functionName
          // ) {
          //   this._cardShownOnFormAction = index;
          //   isShowCard = true;
          //   break;
          // }
        }

        for (let index = 0; index < this.cards.length; index++) {
          const element = this.cards[index];
          // PIZZA
          // if (
          //   element.attributes.dismissListeners &&
          //   element.attributes.dismissListeners === functionName
          // ) {
          //   isHideCard = true;
          //   break;
          // }
        }
      }

      if (!isShowCard && !isHideCard && this.modal) {
        isShowModal =
          this.modal.attributes.listeners &&
          this.modal.attributes.listeners === functionName;
        isHideModal =
          this.modal.attributes.dismissListeners &&
          this.modal.attributes.dismissListeners === functionName;
      }
    }

    if (isShowCard) {
      const card_to_show = this.cards[this._cardShownOnFormAction];
      // PIZZA
      // card_to_show.attributes.hidden = false;
      this.pageService.formVisible();
      this.pageService.modalHidden();

      if (card_to_show.label && card_to_show.label.text) {
        // PIZZA
        // this.pageService.changeHeader(card_to_show.label.text.value);
      }

      for (let index = 0; index < this.cards.length; index++) {
        const element = this.cards[index];
        // PIZZA
        // if (
        //   !element.attributes.hidden &&
        //   (!element.attributes.listeners ||
        //     element.attributes.listeners !== functionName)
        // ) {
        //   this._cardsHiddenOnFormAction.push(index);
        // }
      }

      if (this._cardsHiddenOnFormAction.length > 0) {
        this._cardsHiddenOnFormAction.forEach((cardIndex) => {
          // PIZZA
          // this.cards[cardIndex].attributes.hidden = true;
        });
      }
    } else if (isHideCard) {
      this.next();
      setTimeout(() => {
        this.pageService.formHidden();
        this.pageService.modalHidden();
        if (this._cardsHiddenOnFormAction.length > 0) {
          this._cardsHiddenOnFormAction.forEach((cardIndex) => {
            // PIZZA
            // this.cards[cardIndex].attributes.hidden = false;
          });
        }

        if (this._cardShownOnFormAction >= 0) {
          // PIZZA
          // this.cards[this._cardShownOnFormAction].attributes.hidden = true;
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
      this.next();
      setTimeout(() => {
        if (this._cardsHiddenOnFormAction.length > 0) {
          this._cardsHiddenOnFormAction.forEach((cardIndex) => {
            // PIZZA
            // this.cards[cardIndex].attributes.hidden = false;
          });
        }

        if (this._cardShownOnFormAction >= 0) {
          // PIZZA
          // this.cards[this._cardShownOnFormAction].attributes.hidden = true;
        }

        this._cardShownOnFormAction = -1;
        this._cardsHiddenOnFormAction = [];
      }, 0);
    } else {
      this.pageService.contentEvent(functionName);
    }
  }

  private init(): void {
    this.pageService.setPageOrder(this.order, this.totalPages);
    this.pageService.modalHidden();
    this.pageService.formHidden();
    if (this._page.header) {
      this.header = this._page.header;
      this.hasPageHeader = !!this._page.header.title?.text
    }

    if (this._page.hero) {
      this.hero = this._page.hero;
    }

    if (this.page.cards) {
      const cards = this._page.cards
      this.cards = cards;
    }

    const modals = this.page.modals
    if (modals?.length) {
      this.modal = modals[0];
    }

    const showCalltoAction = !!(this.page.callToAction?.label?.text || this.page.callToAction?.tip)
    if (showCalltoAction) {
      this.callToAction = this.page.callToAction;
    }

    this.formAction$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((action) => {
        this.onFormAction(action);
      });

    this.ready = true;
  }
}
