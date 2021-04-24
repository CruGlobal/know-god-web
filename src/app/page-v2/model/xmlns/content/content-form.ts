import { KgwContentComplexTypeForm } from './content-ct-form';
import { KgwContentElement } from './content-element';

export class KgwContentForm {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwContentComplexTypeForm {
        const item: KgwContentComplexTypeForm = {contentType: 'form', children: []};

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                const cNode = this._xmlNode.childNodes[i];
                const cItem = new KgwContentElement(cNode);
                const cItemParsed = cItem.parse();
                if (cItemParsed && cItemParsed.type !== '') {
                    item.children.push(cItemParsed);
                }
            }
        }

        return item;
    }
}
