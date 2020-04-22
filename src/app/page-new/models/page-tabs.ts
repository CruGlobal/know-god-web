import { PageParserHelper } from '../helpers/page-parser-helper';
import { PageTab, IPageTabContent } from './page-tab';

export class PageTabs {
  content: IPageTabsContent;
  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
      const tNode = this._xmlNode.childNodes[i];
      if (
        tNode.nodeName === 'tab' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageTab = new PageTab(tNode);
        if (_tNewNode.content) {
          if (this.content.tabs === undefined) {
            this.content.tabs = [];
          }
          this.content.tabs.push(_tNewNode.content);
        }
      }
    }
  }
}

export interface IPageTabsContent {
  tabs?: IPageTabContent[];
}
