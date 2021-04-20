import { KgwAnalyticsEvents } from "../analytics/analytics-events";
import { KgwContentComplexTypeTab } from "./content-ct-tab";
import { KgwContentElement } from "./content-element";
import { KgwContentText } from "./content-text";

export class KgwContentTab {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }
    
    parse(): KgwContentComplexTypeTab {
        let item:KgwContentComplexTypeTab = {attributes:{}, children:[]};

        if (this._xmlNode.getAttribute('listeners')) {
            item.attributes.listeners = this._xmlNode.getAttribute('listeners');
        }

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                let cNode = this._xmlNode.childNodes[i];
                if (cNode.nodeName === 'content:label') {
                    let tNode = new KgwContentText(cNode);
                    item.label = tNode.parse();
                } else if (cNode.nodeName === 'analytics:events') {
                    let tNode = new KgwAnalyticsEvents(cNode);
                    item.events = tNode.parse();
                } else {
                    let cItem = new KgwContentElement(cNode);
                    let cItemParsed = cItem.parse();
                    if (cItemParsed && cItemParsed.type !== '') {
                        item.children.push(cItemParsed);
                    }
                }
            }
        }

        return item;
    }
}
