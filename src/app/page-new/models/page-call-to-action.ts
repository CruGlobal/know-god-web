import { IPageTextContent, PageText } from './page-text';

export class PageCallToAction {
  content: IPageCallToActionContent;
  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    if (
      this._xmlNode.getElementsByTagName('content:text') &&
      this._xmlNode.getElementsByTagName('content:text').length > 0
    ) {
      let tNode = this._xmlNode.getElementsByTagName('content:text')[0];
      let _tNewNode: PageText = new PageText(tNode);
      if (_tNewNode.content) {
        this.content = { text: _tNewNode.content };
        if (this._xmlNode.getAttribute('control-color')) {
          this.content.controlColor = this._xmlNode.getAttribute(
            'control-color'
          );
        }
        if (this._xmlNode.getAttribute('events')) {
          this.content.events = this._xmlNode.getAttribute('events');
        }
      }
    }
  }
}

export interface IPageCallToActionContent {
  text: IPageTextContent;
  events?: any;
  controlColor?: string;
}
