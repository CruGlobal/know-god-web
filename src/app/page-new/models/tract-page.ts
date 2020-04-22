import { IPageHeaderContent, PageHeader } from './page-header';
import { PageParserHelper } from '../helpers/page-parser-helper';
import { PageHero, IPageHeroContent } from './page-hero';
import { PageCard, IPageCardContent } from './page-card';
import { IPageModalContent, PageModal } from './page-modal';
import {
  IPageCallToActionContent,
  PageCallToAction
} from './page-call-to-action';

export class TractPage {
  content: ITractPageContent;

  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parsePage();
  }

  private parsePage(): void {
    let _tPageNode = this._xmlNode.childNodes[0];
    this.content = { pagename: '', items: {} };
    for (let i = 0; i < _tPageNode.childNodes.length; i++) {
      let tNode = _tPageNode.childNodes[i];
      if (
        tNode.nodeName === 'header' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageHeader = new PageHeader(tNode);
        if (_tNewNode.content) {
          this.content.items.header = _tNewNode.content;
        }
        //console.log("[PAGE PARSER]: TractPage:Node:Header:", tNode, this.content.items.header);
      }
      if (
        tNode.nodeName === 'hero' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageHero = new PageHero(tNode);
        if (_tNewNode.content) {
          this.content.items.hero = _tNewNode.content;
        }
        //console.log("[PAGE PARSER]: TractPage:Node:Hero:", tNode, this.content.items.hero);
      }
      if (
        tNode.nodeName === 'cards' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        this.content.items.cards = [];
        for (let cardIx = 0; cardIx < tNode.childNodes.length; cardIx++) {
          let _tCardNode = tNode.childNodes[cardIx];
          if (
            _tCardNode.nodeName === 'card' &&
            !PageParserHelper.isNodeRestricted(_tCardNode)
          ) {
            let _tNewNode: PageCard = new PageCard(_tCardNode);
            if (_tNewNode.content) {
              this.content.items.cards.push(_tNewNode.content);
            }
          }
        }
        //console.log("[PAGE PARSER]: TractPage:Node:Cards:", tNode, this.content.items.cards);
      }
      if (
        tNode.nodeName === 'modals' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        this.content.items.modals = [];
        for (let modalIx = 0; modalIx < tNode.childNodes.length; modalIx++) {
          let _tModalNode = tNode.childNodes[modalIx];
          if (
            _tModalNode.nodeName === 'modal' &&
            !PageParserHelper.isNodeRestricted(_tModalNode)
          ) {
            let _tNewNode: PageModal = new PageModal(_tModalNode);
            if (_tNewNode.content) {
              this.content.items.modals.push(_tNewNode.content);
            }
          }
        }
        //console.log("[PAGE PARSER]: TractPage:Node:Modals:", tNode, this.content.items.modals);
      }
      if (
        tNode.nodeName === 'call-to-action' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageCallToAction = new PageCallToAction(tNode);
        if (_tNewNode.content) {
          this.content.items.callToAction = _tNewNode.content;
        }
        //console.log("[PAGE PARSER]: TractPage:Node:CallToAction:", tNode, this.content.items.callToAction);
      }
    }
    if (_tPageNode.getAttribute('primary-color')) {
      this.content.primaryColor = _tPageNode.getAttribute('primary-color');
    }
    if (_tPageNode.getAttribute('primary-text-color')) {
      this.content.primaryTextColor = _tPageNode.getAttribute(
        'primary-text-color'
      );
    }
    if (_tPageNode.getAttribute('text-color')) {
      this.content.textColor = _tPageNode.getAttribute('text-color');
    }
    if (_tPageNode.getAttribute('background-color')) {
      this.content.backgroundColor = _tPageNode.getAttribute(
        'background-color'
      );
    }
    if (_tPageNode.getAttribute('background-image')) {
      this.content.backgroundImage = _tPageNode.getAttribute(
        'background-image'
      );
    }
    if (_tPageNode.getAttribute('background-image-align')) {
      this.content.backgroundImageAlign = _tPageNode.getAttribute(
        'background-image-align'
      );
    }
    if (_tPageNode.getAttribute('background-image-scale-type')) {
      this.content.backgroundImageScaleType = _tPageNode.getAttribute(
        'background-image-scale-type'
      );
    }
    if (_tPageNode.getAttribute('card-text-color')) {
      this.content.cardTextColor = _tPageNode.getAttribute('card-text-color');
    }
    if (_tPageNode.getAttribute('card-background-color')) {
      this.content.cardBackgroundColor = _tPageNode.getAttribute(
        'card-background-color'
      );
    }

    this.content.heading = '';
    if (
      this.content.items &&
      this.content.items.hero &&
      this.content.items.hero.heading &&
      this.content.items.hero.heading.title.text
    ) {
      this.content.heading = this.content.items.hero.heading.title.text;
    }

    if (
      this.content.items &&
      this.content.items.header &&
      this.content.items.header.title &&
      this.content.items.header.title.text
    ) {
      this.content.heading = this.content.items.header.title.text;
    }
  }
}

export interface ITractPageContent {
  pagename?: string;
  heading?: string;
  items?: {
    header?: IPageHeaderContent;
    hero?: IPageHeroContent;
    cards?: IPageCardContent[];
    modals?: IPageModalContent[];
    callToAction?: IPageCallToActionContent;
  };
  primaryColor?: string;
  primaryTextColor?: string;
  textColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundImageAlign?: string;
  backgroundImageScaleType?: string;
  cardTextColor?: string;
  cardBackgroundColor?: string;
  listeners?: any;
}
