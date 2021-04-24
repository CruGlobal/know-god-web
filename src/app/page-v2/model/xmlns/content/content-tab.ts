import { KgwAnalyticsEvents } from '../analytics/analytics-events';
import { KgwContentComplexTypeTab } from './content-ct-tab';
import { KgwContentElement } from './content-element';
import { KgwContentText } from './content-text';

export class KgwContentTab {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwContentComplexTypeTab {
        const item: KgwContentComplexTypeTab = {attributes: {}, children: []};

        if (this._xmlNode.getAttribute('listeners')) {
            item.attributes.listeners = this._xmlNode.getAttribute('listeners');
        }

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                const cNode = this._xmlNode.childNodes[i];
                if (cNode.nodeName === 'content:label') {
                    const tNode = new KgwContentText(cNode);
                    item.label = tNode.parse();
                } else if (cNode.nodeName === 'analytics:events') {
                    const tNode = new KgwAnalyticsEvents(cNode);
                    item.events = tNode.parse();
                } else {
                    const cItem = new KgwContentElement(cNode);
                    const cItemParsed = cItem.parse();
                    if (cItemParsed && cItemParsed.type !== '') {
                        item.children.push(cItemParsed);
                    }
                }
            }
        }

        return item;
    }
}
