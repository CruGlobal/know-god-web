import { KgwAnalyticsEvents } from "../analytics/analytics-events";
import { KgwContentComplexTypeButton } from "./content-ct-button";
import { KgwContentText } from "./content-text";

export class KgwContentButton {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }
    
    parse(): KgwContentComplexTypeButton {
        let item:KgwContentComplexTypeButton = {attributes:{}};

        if (this._xmlNode.getAttribute('type')) {
            item.attributes.type = this._xmlNode.getAttribute('type');
        }
        if (this._xmlNode.getAttribute('events')) {
            item.attributes.events = this._xmlNode.getAttribute('events');
        }
        if (this._xmlNode.getAttribute('url')) {
            item.attributes.url = this._xmlNode.getAttribute('url');
        }
        if (this._xmlNode.getAttribute('url-i18n-id')) {
            item.attributes.urlI18nId = this._xmlNode.getAttribute('url-i18n-id');
        }
        if (this._xmlNode.getAttribute('style')) {
            item.attributes.style = this._xmlNode.getAttribute('style');
        }
        if (this._xmlNode.getAttribute('color')) {
            item.attributes.color = this._xmlNode.getAttribute('color');
        }
        if (this._xmlNode.getAttribute('background-color')) {
            item.attributes.backgroundColor = this._xmlNode.getAttribute('background-color');
        }
        if (this._xmlNode.getAttribute('restrictTo')) {
            var tValue = this._xmlNode.getAttribute('restrictTo') as string;
            if (tValue && tValue.trim().length > 0){
                item.attributes.restrictTo = tValue.trim().split(' ');
            }
        }
        if (this._xmlNode.getAttribute('version')) {
            item.attributes.version = parseInt(this._xmlNode.getAttribute('version'));
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
