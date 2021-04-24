import { KgwAnalyticsComplexTypeEvent } from './analytics-ct-event';
import { KgwAnalyticsEventAttribute } from './analytics-event-attribute';

export class KgwAnalyticsEvent {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwAnalyticsComplexTypeEvent {
    const item: KgwAnalyticsComplexTypeEvent = { attributes: [] };

    if (this._xmlNode.getAttribute('system')) {
      item.system = this._xmlNode.getAttribute('system');
    }
    if (this._xmlNode.getAttribute('action')) {
      item.action = this._xmlNode.getAttribute('action');
    }
    if (this._xmlNode.getAttribute('delay')) {
      item.delay = parseInt(this._xmlNode.getAttribute('delay'), 10);
    }
    if (this._xmlNode.getAttribute('trigger')) {
      item.trigger = this._xmlNode.getAttribute('trigger');
    }

    if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
      for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
        const cNode = this._xmlNode.childNodes[i];
        if (cNode.nodeName === 'analytics:attribute') {
          const tNode = new KgwAnalyticsEventAttribute(cNode);
          item.attributes.push(tNode.parse());
        }
      }
    }

    return item;
  }
}
