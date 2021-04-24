import { KgwContentComplexTypeParagraph } from '../content/content-ct-paragraph';
import { KgwContentElement } from '../content/content-element';
import { KgwContentTextchild } from '../content/content-textchild';
import { KgwTractComplexTypeModal } from './tract-ct-modal';

export class KgwTractModal {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwTractComplexTypeModal {
        const item: KgwTractComplexTypeModal = {attributes: {}, content: []};

        if (this._xmlNode.getAttribute('dismiss-listeners')) {
            item.attributes.dismissListeners = this._xmlNode.getAttribute('dismiss-listeners');
        }

        if (this._xmlNode.getAttribute('listeners')) {
            item.attributes.listeners = this._xmlNode.getAttribute('listeners');
        }

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                const cNode = this._xmlNode.childNodes[i];
                if (cNode.nodeName === 'title') {
                    const node: KgwContentTextchild = new KgwContentTextchild(cNode);
                    item.title = node.parse();
                } else if (cNode.nodeName === 'content:paragraph') {
                    const node: KgwContentElement = new KgwContentElement(cNode);
                    const nodeParsed = node.parse();
                    if (nodeParsed.type && nodeParsed.type === 'paragraph') {
                        item.content.push( node.parse().element as KgwContentComplexTypeParagraph );
                    }
                }
            }
        }

        return item;
    }
}
