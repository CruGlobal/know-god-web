import { PageImage, IPageImageContent } from './page-image';
import { PageText, IPageTextContent } from './page-text';
import { PageButton, IPageButtonContent } from './page-button';
import { PageLink, IPageLinkContent } from './page-link';
import { PageInput, IPageInputContent } from './page-input';
import { PageParagraph } from './page-pragraph';
import { PageForm } from './page-form';
import { PageParserHelper } from '../helpers/page-parser-helper';
import { IPageTabsContent, PageTabs } from './page-tabs';

export class PageElementGroup {
  private _xmlNode: any;
  content: IPageElementGroupContent;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
      let tNode = this._xmlNode.childNodes[i];
      if (
        tNode.nodeName === 'content:image' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageImage = new PageImage(tNode);
        if (_tNewNode.content) {
          if (this.content === undefined) {
            this.content = { items: [] };
          }
          this.content.items.push({
            type: 'image',
            content: _tNewNode.content
          });
        }
      } else if (
        tNode.nodeName === 'content:text' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageText = new PageText(tNode);
        if (_tNewNode.content) {
          if (this.content === undefined) {
            this.content = { items: [] };
          }
          this.content.items.push({ type: 'text', content: _tNewNode.content });
        }
      } else if (
        tNode.nodeName === 'content:button' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageButton = new PageButton(tNode);
        if (_tNewNode.content) {
          if (this.content === undefined) {
            this.content = { items: [] };
          }
          this.content.items.push({
            type: 'button',
            content: _tNewNode.content
          });
        }
      } else if (
        tNode.nodeName === 'content:link' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageLink = new PageLink(tNode);
        if (_tNewNode.content) {
          if (this.content === undefined) {
            this.content = { items: [] };
          }
          this.content.items.push({ type: 'link', content: _tNewNode.content });
        }
      } else if (
        tNode.nodeName === 'content:input' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageInput = new PageInput(tNode);
        if (_tNewNode.content) {
          if (this.content === undefined) {
            this.content = { items: [] };
          }
          this.content.items.push({
            type: 'input',
            content: _tNewNode.content
          });
        }
      } else if (
        tNode.nodeName === 'content:paragraph' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageParagraph = new PageParagraph(tNode);
        if (_tNewNode.content) {
          if (this.content === undefined) {
            this.content = { items: [] };
          }
          this.content.items.push({
            type: 'paragraph',
            content: _tNewNode.content
          });
        }
      } else if (
        tNode.nodeName === 'content:form' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageForm = new PageForm(tNode);
        if (_tNewNode.content) {
          if (this.content === undefined) {
            this.content = { items: [] };
          }
          this.content.items.push({ type: 'form', content: _tNewNode.content });
        }
      } else if (
        tNode.nodeName === 'content:tabs' &&
        !PageParserHelper.isNodeRestricted(tNode)
      ) {
        let _tNewNode: PageTabs = new PageTabs(tNode);
        if (_tNewNode.content) {
          if (this.content === undefined) {
            this.content = { items: [] };
          }
          this.content.items.push({ type: 'tabs', content: _tNewNode.content });
        }
      }
    }
  }
}

export interface IPageElementGroupContent {
  items?: IPageElement[];
}

export interface IPageElement {
  type:
    | 'button'
    | 'link'
    | 'text'
    | 'image'
    | 'input'
    | 'form'
    | 'tabs'
    | 'paragraph';
  content:
    | IPageButtonContent
    | IPageLinkContent
    | IPageTextContent
    | IPageImageContent
    | IPageInputContent
    | IPageTabsContent
    | IPageElementGroupContent;
}
