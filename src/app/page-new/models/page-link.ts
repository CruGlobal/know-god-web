import { IPageTextContent, PageText } from './page-text';
import {
  PageAnalyticsEvents,
  IPageAnalyticsEventsContent
} from './page-analytics-event';

export class PageLink {
  content: IPageLinkContent;

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
      if (_tTextChild.content) {
        this.content = { text: _tTextChild.content };
        if (this._xmlNode.getAttribute('events')) {
          this.content.events = this._xmlNode.getAttribute('events');
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
}

export interface IPageLinkContent {
  text: IPageTextContent;
  analyticsEvents?: IPageAnalyticsEventsContent;
  events?: any;
}
