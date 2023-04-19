import { KgwContentComplexTypeText } from './content-ct-text';

export class KgwContentText {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwContentComplexTypeText {
    const item: KgwContentComplexTypeText = { attributes: {} };

    if (this._xmlNode.getAttribute('i18n-id')) {
      item.attributes.i18n_id = this._xmlNode.getAttribute('i18n-id');
    }
    if (this._xmlNode.getAttribute('text-align')) {
      item.attributes.text_align = this._xmlNode.getAttribute('text-align');
    }
    if (this._xmlNode.getAttribute('text-color')) {
      item.attributes.text_color = this._xmlNode.getAttribute('text-color');
    }
    if (this._xmlNode.getAttribute('text-scale')) {
      item.attributes.text_scale = this._xmlNode.getAttribute('text-scale');
    }
    if (this._xmlNode.getAttribute('text-style')) {
      item.attributes.text_style = this._xmlNode.getAttribute('text-style');
    }
    if (this._xmlNode.getAttribute('start-image')) {
      item.attributes.startImage = this._xmlNode.getAttribute('start-image');
    }
    if (this._xmlNode.getAttribute('start-image-size')) {
      item.attributes.startImageSize = parseInt(
        this._xmlNode.getAttribute('start-image-size'),
        10
      );
    }
    if (this._xmlNode.getAttribute('end-image')) {
      item.attributes.startImage = this._xmlNode.getAttribute('end-image');
    }
    if (this._xmlNode.getAttribute('end-image-size')) {
      item.attributes.startImageSize = parseInt(
        this._xmlNode.getAttribute('end-image-size'),
        10
      );
    }
    if (this._xmlNode.getAttribute('restrictTo')) {
      const tValue = this._xmlNode.getAttribute('restrictTo') as string;
      if (tValue && tValue.trim().length > 0) {
        item.attributes.restrictTo = tValue.trim().split(' ');
      }
    }
    if (this._xmlNode.getAttribute('version')) {
      item.attributes.version = parseInt(
        this._xmlNode.getAttribute('version'),
        10
      );
    }

    if (this._xmlNode.textContent) {
      item.value = this._xmlNode.textContent
        .trim()
        .replace(/(?:\r\n|\r|\n)/g, '<br>');
    }

    return item;
  }
}
