import { KgwContentText } from "../content/content-text";
import { KgwTractComplexTypeCallToAction } from "./tract-ct-call-to-action";

export class KgwTractCallToAction {

    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }
    
    parse(): KgwTractComplexTypeCallToAction {
        let item:KgwTractComplexTypeCallToAction = {attributes:{}};

        if (this._xmlNode.getAttribute('events')) {
            item.attributes.events = this._xmlNode.getAttribute('events');
        }
        if (this._xmlNode.getAttribute('control-color')) {
            item.attributes.controlColor = this._xmlNode.getAttribute('control-color');
        }
        if (this._xmlNode.getAttribute('training:tip')) {
            item.attributes.tip = this._xmlNode.getAttribute('training:tip');
        }

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                let cNode = this._xmlNode.childNodes[i];
                if (cNode.nodeName === 'content:text') {
                    let node:KgwContentText = new KgwContentText(cNode);
                    item.text = node.parse();
                }
            }
        }

        return item;
    }
}
