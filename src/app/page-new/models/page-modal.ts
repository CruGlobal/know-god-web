import { IPageTextContent, PageText } from './page-text';
import { PageParagraph } from './page-pragraph';
import { PageParserHelper } from '../helpers/page-parser-helper';
import { IPageElementGroupContent } from './page-element-group';

export class PageModal {
  content: IPageModalContent;

  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    this.content = {};
    for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
      const tNode = this._xmlNode.childNodes[i];
      if (
        tNode.nodeName === 'title' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        if (
          tNode.getElementsByTagName('content:text') &&
          tNode.getElementsByTagName('content:text').length > 0
        ) {
          let _tNewNode: PageText = new PageText(
            tNode.getElementsByTagName('content:text')[0]
          );
          if (_tNewNode.content) {
            this.content.title = _tNewNode.content;
          }
        }
      }
      if (
        tNode.nodeName === 'content:paragraph' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageParagraph = new PageParagraph(tNode);
        if (_tNewNode.content) {
          if (this.content.items === undefined) {
            this.content.items = [];
          }
          this.content.items.push({
            type: 'paragraph',
            elements: _tNewNode.content
          });
        }
      }
    }
    if (this._xmlNode.getAttribute('listeners')) {
      this.content.listeners = this._xmlNode.getAttribute('listenersr');
    }
    if (this._xmlNode.getAttribute('dismiss-listeners')) {
      this.content.dismissListeners = this._xmlNode.getAttribute(
        'dismiss-listeners'
      );
    }
  }
}

export interface IPageModalContent {
  title?: IPageTextContent;
  items?: IPageModalItem[];
  listeners?: any;
  dismissListeners?: any;
}

export interface IPageModalItem {
  type: 'paragraph';
  elements: IPageElementGroupContent;
}
