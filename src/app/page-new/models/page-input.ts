import { IPageTextContent, PageText } from './page-text';
import { PageParserHelper } from '../helpers/page-parser-helper';

export class PageInput {
  content: IPageInputContent;
  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  private parseNode(): void {
    if (this._xmlNode.getAttribute('name')) {
      this.content = { name: this._xmlNode.getAttribute('name') };
      if (this._xmlNode.getAttribute('type')) {
        this.content.type = this._xmlNode.getAttribute('type');
      }
      if (this._xmlNode.getAttribute('value')) {
        this.content.value = this._xmlNode.getAttribute('value');
      }
      if (this._xmlNode.getAttribute('required')) {
        this.content.required =
          this._xmlNode.getAttribute('required') == 'true';
      }

      if (
        this._xmlNode.getElementsByTagName('content:label') &&
        this._xmlNode.getElementsByTagName('content:label').length > 0
      ) {
        const _tLabelNode = this._xmlNode.getElementsByTagName(
          'content:label'
        )[0];
        if (
          _tLabelNode.getElementsByTagName('content:text') &&
          _tLabelNode.getElementsByTagName('content:text').length > 0
        ) {
          const _tTextNode = _tLabelNode.getElementsByTagName(
            'content:text'
          )[0];
          const _tText: PageText = new PageText(_tTextNode);
          if (_tText.content) {
            this.content.label = _tText.content;
          }
        }
      }

      if (
        this._xmlNode.getElementsByTagName('content:placeholder') &&
        this._xmlNode.getElementsByTagName('content:placeholder').length > 0
      ) {
        const _tPlaceHolderNode = this._xmlNode.getElementsByTagName(
          'content:placeholder'
        )[0];
        if (
          _tPlaceHolderNode.getElementsByTagName('content:text') &&
          _tPlaceHolderNode.getElementsByTagName('content:text').length > 0
        ) {
          const _tTextNode = _tPlaceHolderNode.getElementsByTagName(
            'content:text'
          )[0];
          const _tText: PageText = new PageText(_tTextNode);
          if (_tText.content) {
            this.content.placeholder = _tText.content;
          }
        }
      }
    }
  }
}

export interface IPageInputContent {
  name: string;
  label?: IPageTextContent;
  placeholder?: IPageTextContent;
  type?: string;
  required?: boolean;
  value?: string;
}
