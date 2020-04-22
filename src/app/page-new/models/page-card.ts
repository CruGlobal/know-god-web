import { IPageTextContent, PageText } from './page-text';
import { PageParagraph } from './page-pragraph';
import { PageForm } from './page-form';
import { PageParserHelper } from '../helpers/page-parser-helper';
import { IPageElementGroupContent } from './page-element-group';
import {
  PageAnalyticsEvents,
  IPageAnalyticsEventsContent
} from './page-analytics-event';

export class PageCard {
  content: IPageCardContent;

  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    if (
      this._xmlNode.getElementsByTagName('label') &&
      this._xmlNode.getElementsByTagName('label').length > 0
    ) {
      let tLabelNode = this._xmlNode.getElementsByTagName('label')[0];
      if (!PageParserHelper.isNodeRestricted(tLabelNode)) {
        const _tNewNode: PageText = new PageText(tLabelNode);
        if (_tNewNode.content) {
          this.content = { label: _tNewNode.content };
        }
      }
    }
    if (this.content !== undefined) {
      for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
        const tNode = this._xmlNode.childNodes[i];
        if (
          tNode.nodeName === 'content:paragraph' &&
          !PageParserHelper.isNodeRestricted(tNode)
        ) {
          let _tNewNode: PageParagraph = new PageParagraph(tNode);
          if (_tNewNode.content) {
            if (this.content.items === undefined) {
              this.content.items = [];
            }
            this.content.items.push({
              type: 'paragraph',
              elements: _tNewNode.content
            });
          }
        }
        if (
          tNode.nodeName === 'content:form' &&
          !PageParserHelper.isNodeRestricted(tNode)
        ) {
          let _tNewNode: PageForm = new PageForm(tNode);
          if (_tNewNode.content) {
            if (this.content.items === undefined) {
              this.content.items = [];
            }
            this.content.items.push({
              type: 'form',
              elements: _tNewNode.content
            });
          }
        }
        if (tNode.nodeName === 'analytics:events') {
          let _tNewNode: PageAnalyticsEvents = new PageAnalyticsEvents(tNode);
          if (_tNewNode.content) {
            this.content.analyticsEvents = _tNewNode.content;
          }
        }
      }
      if (this._xmlNode.getAttribute('background-image')) {
        this.content.backgroundImage = this._xmlNode.getAttribute(
          'background-image'
        );
      }
      if (this._xmlNode.getAttribute('background-image-align')) {
        this.content.backgroundImageAlign = this._xmlNode.getAttribute(
          'background-image-align'
        );
      }
      if (this._xmlNode.getAttribute('background-image-scale-type')) {
        this.content.backgroundImageScaleType = this._xmlNode.getAttribute(
          'background-image-scale-type'
        );
      }
      if (this._xmlNode.getAttribute('text-color')) {
        this.content.textColor = this._xmlNode.getAttribute('text-color');
      }
      if (this._xmlNode.getAttribute('listeners')) {
        this.content.listeners = this._xmlNode.getAttribute('listeners');
      }
      if (this._xmlNode.getAttribute('dismiss-listeners')) {
        this.content.dismissListeners = this._xmlNode.getAttribute(
          'dismiss-listeners'
        );
      }
      if (this._xmlNode.getAttribute('hidden')) {
        this.content.hidden = this._xmlNode.getAttribute('hidden') == 'true';
      }
    }
  }
}

export interface IPageCardContent {
  label: IPageTextContent;
  analyticsEvents?: IPageAnalyticsEventsContent;
  items?: IPageCardContentElement[];

  backgroundImage?: string;
  backgroundImageAlign?: string;
  backgroundImageScaleType?: string;
  textColor?: string;
  hidden?: boolean;
  listeners?: any;
  dismissListeners?: any;
}

export interface IPageCardContentElement {
  type: 'paragraph' | 'form';
  elements: IPageElementGroupContent;
}
