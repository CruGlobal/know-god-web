import { KgwContentAccordionSection } from './content-accordion-section';
import { KgwContentComplexTypeAccordion } from './content-ct-accordion';

export class KgwContentAccordion {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwContentComplexTypeAccordion {
    const item: KgwContentComplexTypeAccordion = { sections: [] };

    if (this._xmlNode.childNodes && this._xmlNode.childNodes.length) {
      for (let i = 0; i < this._xmlNode.childNodes.length; i++) {
        const cNode = this._xmlNode.childNodes[i];
        if (cNode.nodeName && cNode.nodeName === 'content:section') {
          const cItem = new KgwContentAccordionSection(cNode);
          const cItemParsed = cItem.parse();
          if (cItemParsed && cItemParsed.header) {
            item.sections.push(cItemParsed);
          }
        }
      }
    }

    return item;
  }
}
