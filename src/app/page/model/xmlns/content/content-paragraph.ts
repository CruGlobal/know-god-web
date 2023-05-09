import { KgwContentComplexTypeParagraph } from './content-ct-paragraph';
import { KgwContentElement } from './content-element';

export class KgwContentParagraph {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwContentComplexTypeParagraph {
    const item: KgwContentComplexTypeParagraph = {
      contentType: 'paragraph',
      attributes: {},
      children: [],
    };

    if (this._xmlNode.getAttribute('restrictTo')) {
      const tValue = this._xmlNode.getAttribute('restrictTo') as string;
      if (tValue && tValue.trim().length > 0) {
        item.attributes.restrictTo = tValue.trim().split(' ');
      }
    }

    if (this._xmlNode.getAttribute('version')) {
      item.attributes.version = parseInt(
        this._xmlNode.getAttribute('version'),
        10,
      );
    }

    if (this._xmlNode.getAttribute('fallback')) {
      item.attributes.fallback =
        this._xmlNode.getAttribute('fallback') === 'true';
    }

    if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
      for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
        const cNode = this._xmlNode.childNodes[i];
        const cItem = new KgwContentElement(cNode);
        const cItemParsed = cItem.parse();
        if (cItemParsed && cItemParsed.type !== '') {
          item.children.push(cItemParsed);
        }
      }
    }

    return item;
  }
}
