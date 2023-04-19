import { KgwAnalyticsEvents } from '../analytics/analytics-events';
import { KgwContentComplexTypeLink } from './content-ct-link';
import { KgwContentText } from './content-text';

export class KgwContentLink {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwContentComplexTypeLink {
    const item: KgwContentComplexTypeLink = { attributes: {} };

    if (this._xmlNode.getAttribute('events')) {
      item.attributes.events = this._xmlNode.getAttribute('events');
    }

    if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
      for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
        const cNode = this._xmlNode.childNodes[i];
        if (cNode.nodeName === 'content:text') {
          const tNode = new KgwContentText(cNode);
          item.text = tNode.parse();
        } else if (cNode.nodeName === 'analytics:events') {
          const tNode = new KgwAnalyticsEvents(cNode);
          item.events = tNode.parse();
        }
      }
    }

    return item;
  }
}
