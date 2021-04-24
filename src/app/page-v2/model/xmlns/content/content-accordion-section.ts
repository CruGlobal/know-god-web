import { KgwContentComplexTypeAccordionSection } from './content-ct-accordion-section';
import { KgwContentElement } from './content-element';
import { KgwContentText } from './content-text';

export class KgwContentAccordionSection {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwContentComplexTypeAccordionSection {
        const item: KgwContentComplexTypeAccordionSection = {children: []};

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                const cNode = this._xmlNode.childNodes[i];
                if (cNode.nodeName === 'content:header') {
                    const tNode = new KgwContentText(cNode);
                    item.header = tNode.parse();
                } else {
                    const cItem = new KgwContentElement(cNode);
                    const cItemParsed = cItem.parse();
                    if (cItemParsed && cItemParsed.type !== '') {
                        item.children.push(cItemParsed);
                    }
                }
            }
        }

        return item;
    }
}
