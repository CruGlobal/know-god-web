export interface KgwManifestComplexTypeResource {
  filename?: string;
  src: string;
}

export class KgwManifestResource {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwManifestComplexTypeResource {
    const item: KgwManifestComplexTypeResource = { src: '' };

    if (this._xmlNode.getAttribute('filename')) {
      item.filename = this._xmlNode.getAttribute('filename');
    }

    if (this._xmlNode.getAttribute('src')) {
      item.src = this._xmlNode.getAttribute('src');
    }

    return item;
  }
}
