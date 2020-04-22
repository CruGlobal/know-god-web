import { IPageTextContent, PageText } from './page-text';
import {
  PageAnalyticsEvents,
  IPageAnalyticsEventsContent
} from './page-analytics-event';

export class PageButton {
  content: IPageButtonContent;
  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    let _tTextNode;
    for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
      let tNode = this._xmlNode.childNodes[i];
      if (tNode.nodeName === 'content:text') {
        _tTextNode = tNode;
      }
    }

    if (_tTextNode) {
      let _tTextChild: PageText = new PageText(_tTextNode);
      let _tButtonType: string = this._xmlNode.getAttribute('type');
      if (_tTextChild.content && _tButtonType) {
        this.content = { text: _tTextChild.content, type: _tButtonType };
        if (this._xmlNode.getAttribute('events')) {
          this.content.events = this._xmlNode.getAttribute('events');
        }
        if (this._xmlNode.getAttribute('color')) {
          this.content.color = this._xmlNode.getAttribute('color');
        }
        if (this._xmlNode.getAttribute('url')) {
          this.content.url = this.toAbsoluteUrl(
            this._xmlNode.getAttribute('url')
          );
        }
        if (
          this._xmlNode.getElementsByTagName('analytics:events') &&
          this._xmlNode.getElementsByTagName('analytics:events').length > 0
        ) {
          const tEventsNode = this._xmlNode.getElementsByTagName(
            'analytics:events'
          )[0];
          const _tNewNode: PageAnalyticsEvents = new PageAnalyticsEvents(
            tEventsNode
          );
          if (_tNewNode.content) {
            this.content.analyticsEvents = _tNewNode.content;
          }
        }
      }
    }
  }

  private toAbsoluteUrl(link: string): string {
    if (!link || link.trim().length === 0) {
      return '';
    }
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      link = `http://${link}`;
    }
    return link;
  }
}

export interface IPageButtonContent {
  text: IPageTextContent;
  type: string;
  color?: string;
  events?: any;
  url?: string;
  analyticsEvents?: IPageAnalyticsEventsContent;
}
