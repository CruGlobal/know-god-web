export class PageImage {
  content: IPageImageContent;

  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    if (this._xmlNode.getAttribute('resource')) {
      this.content = { resource: this._xmlNode.getAttribute('resource') };
      if (this._xmlNode.getAttribute('events')) {
        this.content.events = this._xmlNode.getAttribute('events');
      }
    }
  }
}

export interface IPageImageContent {
  resource: string;
  events?: any;
}
