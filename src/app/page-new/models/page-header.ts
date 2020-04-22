import { IPageTextContent, PageText } from './page-text';

export class PageHeader {
  content: IPageHeaderContent;

  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    let _tTitleNode;
    let _tNumberNode;
    for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
      let tNode = this._xmlNode.childNodes[i];
      if (tNode.nodeName === 'number') {
        _tNumberNode = tNode;
      }
      if (tNode.nodeName === 'title') {
        _tTitleNode = tNode;
      }
    }
    if (_tTitleNode) {
      let _tTextNode;
      for (let i = 0; i < _tTitleNode.childNodes.length; i++) {
        let tNode = _tTitleNode.childNodes[i];
        if (tNode.nodeName === 'content:text') {
          _tTextNode = tNode;
        }
      }
      if (_tTextNode) {
        let _tTextChild: PageText = new PageText(_tTextNode);
        if (_tTextChild.content) {
          this.content = { title: _tTextChild.content };
          if (
            _tNumberNode &&
            _tNumberNode.getElementsByTagName('content:text') &&
            _tNumberNode.getElementsByTagName('content:text').length > 0
          ) {
            this.content.number = _tNumberNode.getElementsByTagName(
              'content:text'
            )[0].textContent;
          }
          if (this._xmlNode.getAttribute('background-color')) {
            this.content.backgroundColor = this._xmlNode.getAttribute(
              'background-color'
            );
          }
        }
      }
    }
  }
}

export interface IPageHeaderContent {
  title: IPageTextContent;
  number?: string;
  backgroundColor?: string;
}
