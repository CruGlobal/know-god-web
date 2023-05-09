import { KgwContentComplexTypeSpacer } from './content-ct-spacer';

export class KgwContentSpacer {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwContentComplexTypeSpacer {
    const item: KgwContentComplexTypeSpacer = {
      type: 'spacer',
      attributes: {},
    };

    if (this._xmlNode.getAttribute('mode')) {
      item.attributes.mode = this._xmlNode.getAttribute('mode');
    }

    if (this._xmlNode.getAttribute('height')) {
      item.attributes.height = parseInt(
        this._xmlNode.getAttribute('height'),
        10,
      );
    }

    return item;
  }
}
