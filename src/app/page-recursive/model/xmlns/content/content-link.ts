import { KgwAnalyticsEvents } from "../analytics/analytics-events";
import { KgwContentComplexTypeLink } from "./content-ct-link";
import { KgwContentText } from "./content-text";

export class KgwContentLink {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }
    
    parse(): KgwContentComplexTypeLink {
        let item:KgwContentComplexTypeLink = {attributes:{}};

        if (this._xmlNode.getAttribute('events')) {
            item.attributes.events = this._xmlNode.getAttribute('events');
        }

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                let cNode = this._xmlNode.childNodes[i];
                if (cNode.nodeName === 'content:text') {
                    let tNode = new KgwContentText(cNode);
                    item.text = tNode.parse();
                } else if (cNode.nodeName === 'analytics:events') {
                    let tNode = new KgwAnalyticsEvents(cNode);
                    item.events = tNode.parse();
                }
            }
        }

        return item;
    }
}