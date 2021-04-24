import { KgwContentComplexTypeTextchild } from '../content/content-ct-text-child';
import { KgwContentTextchild } from '../content/content-textchild';

export interface KgwManifestComplexTypeCategory {
    id: string;
    banner: string;
    label: KgwContentComplexTypeTextchild;
    categoryElements?: {
        aem_tag?: any;
    };
}

export class KgwManifestCategory {
    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwManifestComplexTypeCategory {
        const item: KgwManifestComplexTypeCategory = {id: '', banner: '', label: {}};

        if (this._xmlNode.getAttribute('id')) {
            item.id = this._xmlNode.getAttribute('id');
        }

        if (this._xmlNode.getAttribute('banner')) {
            item.banner = this._xmlNode.getAttribute('banner');
        }

        if (
            this._xmlNode.getElementsByTagName('label') &&
            this._xmlNode.getElementsByTagName('label').length > 0
          ) {
            const tLabelNode = this._xmlNode.getElementsByTagName('label')[0];
            const _t: KgwContentTextchild = new KgwContentTextchild(tLabelNode);
            item.label = _t.parse();
        }

        return item;
    }
}
