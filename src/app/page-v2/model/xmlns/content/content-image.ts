import { KgwContentComplexTypeImage } from './content-ct-image';

export class KgwContentImage {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwContentComplexTypeImage {
        const item: KgwContentComplexTypeImage = {attributes: {}};

        if (this._xmlNode.getAttribute('restrictTo')) {
            const tValue = this._xmlNode.getAttribute('restrictTo') as string;
            if (tValue && tValue.trim().length > 0) {
                item.attributes.restrictTo = tValue.trim().split(' ');
            }
        }
        if (this._xmlNode.getAttribute('version')) {
            item.attributes.version = parseInt(this._xmlNode.getAttribute('version'), 10);
        }
        if (this._xmlNode.getAttribute('events')) {
            item.attributes.events = this._xmlNode.getAttribute('events');
        }
        if (this._xmlNode.getAttribute('resource')) {
            item.attributes.resource = this._xmlNode.getAttribute('resource');
        }

        return item;
    }
}
