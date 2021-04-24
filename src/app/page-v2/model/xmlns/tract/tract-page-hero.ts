import { KgwAnalyticsEvents } from '../analytics/analytics-events';
import { KgwContentComplexTypeForm } from '../content/content-ct-form';
import { KgwContentComplexTypeParagraph } from '../content/content-ct-paragraph';
import { KgwContentElement } from '../content/content-element';
import { KgwContentTextchild } from '../content/content-textchild';
import { KgwTractComplexTypePageHero } from './tract-ct-page-hero';

export class KgwTractPageHero {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwTractComplexTypePageHero {
        const item: KgwTractComplexTypePageHero = {content: []};

        if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
            for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
                const cNode = this._xmlNode.childNodes[i];
                if (cNode.nodeName === 'heading') {
                    const node: KgwContentTextchild = new KgwContentTextchild(cNode);
                    item.heading = node.parse();
                } else if (cNode.nodeName === 'analytics:events') {
                    const node: KgwAnalyticsEvents = new KgwAnalyticsEvents(cNode);
                    item.events = node.parse();
                } else if (cNode.nodeName === 'content:paragraph') {
                    const node: KgwContentElement = new KgwContentElement(cNode);
                    const nodeParsed = node.parse();
                    if (nodeParsed.type && nodeParsed.type === 'paragraph') {
                        item.content.push( node.parse().element as KgwContentComplexTypeParagraph );
                    }
                } else if (cNode.nodeName === 'content:form') {
                    const node: KgwContentElement = new KgwContentElement(cNode);
                    const nodeParsed = node.parse();
                    if (nodeParsed.type && nodeParsed.type === 'form') {
                        item.content.push( node.parse().element as KgwContentComplexTypeForm );
                    }
                }
            }
        }

        return item;
    }
}
