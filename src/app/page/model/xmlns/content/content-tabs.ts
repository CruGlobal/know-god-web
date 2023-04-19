import { KgwContentComplexTypeTabs } from './content-ct-tabs';
import { KgwContentTab } from './content-tab';

export class KgwContentTabs {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwContentComplexTypeTabs {
    const item: KgwContentComplexTypeTabs = { tabs: [] };

    if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
      for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
        const cNode = this._xmlNode.childNodes[i];
        if (cNode.nodeName && cNode.nodeName === 'content:tab') {
          const cItem = new KgwContentTab(cNode);
          const cItemParsed = cItem.parse();
          if (cItemParsed && cItemParsed.label) {
            item.tabs.push(cItemParsed);
          }
        }
      }
    }

    return item;
  }
}
