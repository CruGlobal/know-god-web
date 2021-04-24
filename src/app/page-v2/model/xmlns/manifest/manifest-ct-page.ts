export interface KgwManifestComplexTypePage {
    filename?: string;
    src: string;
}

export class KgwManifestPage {

    private _xmlNode: any;

    constructor(xmlNode: any) {
        this._xmlNode = xmlNode;
    }

    parse(): KgwManifestComplexTypePage {
        const item: KgwManifestComplexTypePage = {src: ''};

        if (this._xmlNode.getAttribute('filename')) {
            item.filename = this._xmlNode.getAttribute('filename');
        }

        if (this._xmlNode.getAttribute('src')) {
            item.src = this._xmlNode.getAttribute('src');
        }

        return item;
    }
}
