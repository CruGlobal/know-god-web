import { IPageTextContent, PageText } from './page-text';
import { PageParserHelper } from '../helpers/page-parser-helper';
import {
  IPageElementGroupContent,
  PageElementGroup
} from './page-element-group';
import {
  PageAnalyticsEvents,
  IPageAnalyticsEventsContent
} from './page-analytics-event';

export class PageTab {
  content: IPageTabContent;
  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    if (
      this._xmlNode.childNodes.getElementsByTagName('label') &&
      this._xmlNode.childNodes.getElementsByTagName('label').length > 0
    ) {
      let tLabelNode = this._xmlNode.childNodes.getElementsByTagName(
        'label'
      )[0];
      if (!PageParserHelper.isNodeRestricted(tLabelNode)) {
        const _tNewNode: PageText = new PageText(tLabelNode);
        if (_tNewNode.content) {
          this.content = { label: _tNewNode.content };

          const tElementGroup: PageElementGroup = new PageElementGroup(
            this._xmlNode
          );
          if (
            tElementGroup &&
            tElementGroup.content &&
            tElementGroup.content.items &&
            tElementGroup.content.items.length > 0
          ) {
            this.content.elements = { items: [] };
            tElementGroup.content.items.forEach(element => {
              this.content.elements.items.push(element);
            });
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
}

export interface IPageTabContent {
  label: IPageTextContent;
  analyticsEvents?: IPageAnalyticsEventsContent;
  elements?: IPageElementGroupContent;
}
