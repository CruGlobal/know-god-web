export interface KgwManifestComplexTypeTip {
  id: string;
  src: string;
}

export class KgwManifestTip {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwManifestComplexTypeTip {
    const item: KgwManifestComplexTypeTip = { src: '', id: '' };

    if (this._xmlNode.getAttribute('id')) {
      item.id = this._xmlNode.getAttribute('id');
    }

    if (this._xmlNode.getAttribute('src')) {
      item.src = this._xmlNode.getAttribute('src');
    }

    return item;
  }
}
