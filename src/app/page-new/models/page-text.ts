export class PageText {
  content: IPageTextContent;

  private _xmlNode: any;

  constructor(pXmlNode: Node) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    this.content = {
      text: this._xmlNode.textContent.trim().replace(/(?:\r\n|\r|\n)/g, '<br>')
    };
    if (this._xmlNode.getAttribute('i18n-id')) {
      this.content.i18nId = this._xmlNode.getAttribute('i18n-id');
    }
    if (this._xmlNode.getAttribute('text-color')) {
      this.content.textColor = this._xmlNode.getAttribute('text-color');
    }
    if (this._xmlNode.getAttribute('text-scale')) {
      this.content.textScale = this._xmlNode.getAttribute('text-scale');
    }
    if (this._xmlNode.getAttribute('text-style')) {
      this.content.textAlign = this._xmlNode.getAttribute('text-style');
    }
    if (this._xmlNode.getAttribute('text-align')) {
      this.content.textStyle = this._xmlNode.getAttribute('text-align');
    }
  }
}

export interface IPageTextContent {
  text: string;
  i18nId?: string;
  textColor?: string;
  textScale?: string;
  textAlign?: string;
  textStyle?: string;
}
