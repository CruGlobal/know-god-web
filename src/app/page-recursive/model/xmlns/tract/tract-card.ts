import { KgwAnalyticsEvents } from "../analytics/analytics-events";
import { KgwContentComplexTypeForm } from "../content/content-ct-form";
import { KgwContentComplexTypeParagraph } from "../content/content-ct-paragraph";
import { KgwContentElement } from "../content/content-element";
import { KgwContentTextchild } from "../content/content-textchild";
import { KgwTractComplexTypeCard } from "./tract-ct-card";

export class KgwTractCard {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }
    
    parse(): KgwTractComplexTypeCard {
        let item:KgwTractComplexTypeCard = {attributes:{}, content:[], events:[]};

        if (this._xmlNode.getAttribute('background-color')) {
            item.attributes.backgroundColor = this._xmlNode.getAttribute('background-color');
        }

        if (this._xmlNode.getAttribute('background-image')) {
            item.attributes.backgroundImage = this._xmlNode.getAttribute('background-image');
        }
        
        if (this._xmlNode.getAttribute('background-image-align')) {
            item.attributes.backgroundImageAlign = this._xmlNode.getAttribute('background-image-align');
        }
        
        if (this._xmlNode.getAttribute('background-image-scale-type')) {
            item.attributes.backgroundImageScaleType = this._xmlNode.getAttribute('background-image-scale-type');
        }
        
        if (this._xmlNode.getAttribute('text-color')) {
            item.attributes.textColor = this._xmlNode.getAttribute('text-color');
        }
                
        if (this._xmlNode.getAttribute('dismiss-listeners')) {
            item.attributes.dismissListeners = this._xmlNode.getAttribute('dismiss-listeners');
        }
        
        if (this._xmlNode.getAttribute('listeners')) {
            item.attributes.listeners = this._xmlNode.getAttribute('listeners');
        }

        if (this._xmlNode.getAttribute('hidden')) {
            item.attributes.hidden = this._xmlNode.getAttribute('hidden') === 'true';
        }

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                let cNode = this._xmlNode.childNodes[i];
                if (cNode.nodeName === 'label') {
                    let node:KgwContentTextchild = new KgwContentTextchild(cNode);
                    item.label = node.parse();
                } else if (cNode.nodeName === 'analytics:events') {
                    let node:KgwAnalyticsEvents = new KgwAnalyticsEvents(cNode);
                    item.events.push(node.parse());                    
                } else if (cNode.nodeName === 'content:paragraph') {
                    let node:KgwContentElement = new KgwContentElement(cNode);
                    let nodeParsed = node.parse();
                    if (nodeParsed.type && nodeParsed.type === 'paragraph'){
                        item.content.push( node.parse().element as KgwContentComplexTypeParagraph );
                    }
                } else if (cNode.nodeName === 'content:form') {
                    let node:KgwContentElement = new KgwContentElement(cNode);
                    let nodeParsed = node.parse();
                    if (nodeParsed.type && nodeParsed.type === 'form'){
                        item.content.push( node.parse().element as KgwContentComplexTypeForm );
                    }
                }
            }
        }

        return item;
    }    
}