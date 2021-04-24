import { KgwContentComplexTypeInput } from './content-ct-input';
import { KgwContentTextchild } from './content-textchild';

export class KgwContentInput {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwContentComplexTypeInput {
        const item: KgwContentComplexTypeInput = {attributes: {}};

        if (this._xmlNode.getAttribute('name')) {
            item.attributes.name = this._xmlNode.getAttribute('name');
        }
        if (this._xmlNode.getAttribute('type')) {
            item.attributes.type = this._xmlNode.getAttribute('type');
        }
        if (this._xmlNode.getAttribute('required')) {
            item.attributes.required = this._xmlNode.getAttribute('required') === 'true';
        }
        if (this._xmlNode.getAttribute('value')) {
            item.attributes.value = this._xmlNode.getAttribute('value');
        }

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                const cNode = this._xmlNode.childNodes[i];
                if (cNode.nodeName === 'content:label') {
                    const tNode = new KgwContentTextchild(cNode);
                    item.label = tNode.parse();
                } else if (cNode.nodeName === 'content:placeholder') {
                    const tNode = new KgwContentTextchild(cNode);
                    item.placeholder = tNode.parse();
                }
            }
        }

        return item;
    }
}
