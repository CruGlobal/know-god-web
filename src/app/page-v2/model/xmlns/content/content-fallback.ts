import { KgwContentComplexTypeFallback } from "./content-ct-fallback";
import { KgwContentElement } from "./content-element";

export class KgwContentFallback {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwContentComplexTypeFallback {
        let item:KgwContentComplexTypeFallback = {children: []};

        
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
