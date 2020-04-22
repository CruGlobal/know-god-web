import {
  PageElementGroup,
  IPageElementGroupContent
} from './page-element-group';

export class PageForm {
  content: IPageElementGroupContent;

  private _xmlNode: any;

  constructor(pXmlNode: any) {
    this._xmlNode = pXmlNode;
    this.parseNode();
  }

  parseNode(): void {
    const tElementGroup: PageElementGroup = new PageElementGroup(this._xmlNode);
    if (
      tElementGroup &&
      tElementGroup.content &&
      tElementGroup.content.items &&
      tElementGroup.content.items.length > 0
    ) {
      this.content = { items: [] };
      tElementGroup.content.items.forEach(element => {
        this.content.items.push(element);
      });
    }
  }
}
