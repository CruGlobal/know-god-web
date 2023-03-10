import { KgwAnalyticsComplexTypeEvents } from './analytics-ct-events';
import { KgwAnalyticsEvent } from './analytics-event';

export class KgwAnalyticsEvents {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwAnalyticsComplexTypeEvents {
    const item: KgwAnalyticsComplexTypeEvents = { children: [] };

    if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
      for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
        const cNode = this._xmlNode.childNodes[i];
        if (cNode.nodeName === 'analytics:event') {
          const tNode = new KgwAnalyticsEvent(cNode);
          item.children.push(tNode.parse());
        }
      }
    }

    return item;
  }
}
