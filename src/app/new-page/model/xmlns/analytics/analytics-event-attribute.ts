import { KgwAnalyticsComplexTypeAttribute } from './analytics-ct-attribute';

export class KgwAnalyticsEventAttribute {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwAnalyticsComplexTypeAttribute {
    const item: KgwAnalyticsComplexTypeAttribute = { key: '', value: '' };

    if (this._xmlNode.getAttribute('key')) {
      item.key = this._xmlNode.getAttribute('key');
    }
    if (this._xmlNode.getAttribute('value')) {
      item.value = this._xmlNode.getAttribute('value');
    }

    return item;
  }
}
