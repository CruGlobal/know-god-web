import { KgwContentComplexTypeForm } from "./content-ct-form";
import { KgwContentElement } from "./content-element";

export class KgwContentForm {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }
    
    parse(): KgwContentComplexTypeForm {
        let item:KgwContentComplexTypeForm = {contentType: 'form', children: []};
        
        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                let cNode = this._xmlNode.childNodes[i];
                let cItem = new KgwContentElement(cNode);
                let cItemParsed = cItem.parse();
                if (cItemParsed && cItemParsed.type !== '') {
                    item.children.push(cItemParsed);
                }
            }
        }

        return item;
    }  
}