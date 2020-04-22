import { PageParagraph } from './page-pragraph';
import { PageParserHelper } from '../helpers/page-parser-helper';
import { IPageTextContent, PageText } from './page-text';
import { IPageElementGroupContent } from './page-element-group';
import { PageForm } from './page-form';
import {
  PageAnalyticsEvents,
  IPageAnalyticsEventsContent
} from './page-analytics-event';
import { IPageHeaderContent } from './page-header';

export class PageHero {
  content: IPageHeroContent;

  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    this.content = {};
    for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
      const tNode = this._xmlNode.childNodes[i];
      if (
        tNode.nodeName === 'heading' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        if (
          tNode.getElementsByTagName('content:text') &&
          tNode.getElementsByTagName('content:text').length > 0
        ) {
          let _tNewNode: PageText = new PageText(
            tNode.getElementsByTagName('content:text')[0]
          );
          if (_tNewNode.content) {
            this.content.heading = { title: _tNewNode.content };
          }
        }
      }
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
  }
}

export interface IPageHeroContent {
  heading?: IPageHeaderContent;
  analyticsEvents?: IPageAnalyticsEventsContent;
  items?: IPageHeroContentElement[];
}

export interface IPageHeroContentElement {
  type: 'paragraph' | 'form';
  elements: IPageElementGroupContent;
}
