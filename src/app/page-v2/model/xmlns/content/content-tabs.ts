import { KgwContentComplexTypeTabs } from "./content-ct-tabs";
import { KgwContentTab } from "./content-tab";

export class KgwContentTabs {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }
    
    parse(): KgwContentComplexTypeTabs {
        let item:KgwContentComplexTypeTabs = {tabs:[]};

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                let cNode = this._xmlNode.childNodes[i];
                if (cNode.nodeName && cNode.nodeName === 'content:tab') {
                    let cItem = new KgwContentTab(cNode);
                    let cItemParsed = cItem.parse();
                    if (cItemParsed && cItemParsed.label) {
                        item.tabs.push(cItemParsed);
                    }
                }
            }
        }

        return item;
    }
}
