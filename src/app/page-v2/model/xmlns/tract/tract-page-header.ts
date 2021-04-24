import { KgwContentTextchild } from '../content/content-textchild';
import { KgwTractComplexTypePageHeader } from './tract-ct-page-header';

export class KgwTractPageHeader {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwTractComplexTypePageHeader {
    const item: KgwTractComplexTypePageHeader = { attributes: {} };

    if (this._xmlNode.getAttribute('training:tip')) {
      item.attributes.tip = this._xmlNode.getAttribute('training:tip');
    }

    if (this._xmlNode.getAttribute('background-color')) {
      item.attributes.backgroundColor = this._xmlNode.getAttribute(
        'background-color'
      );
    }

    if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
      for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
        const cNode = this._xmlNode.childNodes[i];
        if (cNode.nodeName === 'number') {
          if (
            cNode.getElementsByTagName('content:text') &&
            cNode.getElementsByTagName('content:text').length > 0
          ) {
            const tNode = cNode.getElementsByTagName('content:text')[0];
            item.number = parseInt(tNode.textContent.trim(), 10);
          }
        } else if (cNode.nodeName === 'title') {
          const node: KgwContentTextchild = new KgwContentTextchild(cNode);
          item.title = node.parse();
        }
      }
    }

    return item;
  }
}
