import { KgwContentElement } from "../content/content-element";
import { KgwTrainingComplexTypePage } from "./training-ct-page";

export class KgwTrainingPage {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }
    
    parse(): KgwTrainingComplexTypePage {
        let item:KgwTrainingComplexTypePage = {content: []};
        
        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                let cNode = this._xmlNode.childNodes[i];
                let cItem = new KgwContentElement(cNode);
                let cItemParsed = cItem.parse();
                if (cItemParsed && cItemParsed.type !== '') {
                    item.content.push(cItemParsed);
                }
            }
        }

        return item;
    }
}
