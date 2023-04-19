import { KgwContentElement } from '../content/content-element';
import { KgwTrainingComplexTypePage } from './training-ct-page';

export class KgwTrainingPage {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwTrainingComplexTypePage {
    const item: KgwTrainingComplexTypePage = { content: [] };

    if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
      for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
        const cNode = this._xmlNode.childNodes[i];
        const cItem = new KgwContentElement(cNode);
        const cItemParsed = cItem.parse();
        if (cItemParsed && cItemParsed.type !== '') {
          item.content.push(cItemParsed);
        }
      }
    }

    return item;
  }
}
