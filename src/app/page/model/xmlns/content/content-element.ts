import { KgwTrainingComplexTypeTip } from '../training/training-ct-tip';
import { KgwContentAccordion } from './content-accordion';
import { KgwContentAnimation } from './content-animation';
import { KgwContentButton } from './content-button';
import { KgwContentComplexTypeAccordion } from './content-ct-accordion';
import { KgwContentComplexTypeAnimation } from './content-ct-animation';
import { KgwContentComplexTypeButton } from './content-ct-button';
import { KgwContentComplexTypeFallback } from './content-ct-fallback';
import { KgwContentComplexTypeForm } from './content-ct-form';
import { KgwContentComplexTypeImage } from './content-ct-image';
import { KgwContentComplexTypeInput } from './content-ct-input';
import { KgwContentComplexTypeLink } from './content-ct-link';
import { KgwContentComplexTypeParagraph } from './content-ct-paragraph';
import { KgwContentComplexTypeSpacer } from './content-ct-spacer';
import { KgwContentComplexTypeTabs } from './content-ct-tabs';
import { KgwContentComplexTypeText } from './content-ct-text';
import { KgwContentComplexTypeVideo } from './content-ct-video';
import { KgwContentFallback } from './content-fallback';
import { KgwContentForm } from './content-form';
import { KgwContentImage } from './content-image';
import { KgwContentInput } from './content-input';
import { KgwContentLink } from './content-link';
import { KgwContentParagraph } from './content-paragraph';
import { KgwContentSpacer } from './content-spacer';
import { KgwContentTabs } from './content-tabs';
import { KgwContentText } from './content-text';
import { KgwContentVideo } from './content-video';

export interface KgwContentElementItem {
  type?:
    | 'paragraph'
    | 'tabs'
    | 'accordion'
    | 'text'
    | 'image'
    | 'video'
    | 'animation'
    | 'button'
    | 'link'
    | 'form'
    | 'input'
    | 'fallback'
    | 'spacer'
    | 'tip'
    | '';

  element?:
    | KgwContentComplexTypeParagraph
    | KgwContentComplexTypeTabs
    | KgwContentComplexTypeAccordion
    | KgwContentComplexTypeText
    | KgwContentComplexTypeImage
    | KgwContentComplexTypeVideo
    | KgwContentComplexTypeAnimation
    | KgwContentComplexTypeButton
    | KgwContentComplexTypeLink
    | KgwContentComplexTypeForm
    | KgwContentComplexTypeInput
    | KgwContentComplexTypeFallback
    | KgwContentComplexTypeSpacer
    | KgwTrainingComplexTypeTip;
}

export class KgwContentElement {
  private _xmlNode: any;

  constructor(xmlNode: any) {
    this._xmlNode = xmlNode;
  }

  parse(): KgwContentElementItem {
    const item: KgwContentElementItem = {};

    if (this._xmlNode.nodeName === 'content:paragraph') {
      item.type = 'paragraph';
      const tNode = new KgwContentParagraph(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:tabs') {
      item.type = 'tabs';
      const tNode = new KgwContentTabs(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:accordion') {
      item.type = 'accordion';
      const tNode = new KgwContentAccordion(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:text') {
      item.type = 'text';
      const tNode = new KgwContentText(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:image') {
      item.type = 'image';
      const tNode = new KgwContentImage(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:video') {
      item.type = 'video';
      const tNode = new KgwContentVideo(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:animation') {
      item.type = 'animation';
      const tNode = new KgwContentAnimation(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:button') {
      item.type = 'button';
      const tNode = new KgwContentButton(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:link') {
      item.type = 'link';
      const tNode = new KgwContentLink(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:form') {
      item.type = 'form';
      const tNode = new KgwContentForm(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:input') {
      item.type = 'input';
      const tNode = new KgwContentInput(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:fallback') {
      item.type = 'fallback';
      const tNode = new KgwContentFallback(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'content:spacer') {
      item.type = 'spacer';
      const tNode = new KgwContentSpacer(this._xmlNode);
      item.element = tNode.parse();
    } else if (this._xmlNode.nodeName === 'training:tip') {
      item.type = 'tip';
      item.element = {} as KgwTrainingComplexTypeTip;
      if (this._xmlNode.getAttribute('id')) {
        item.element.id = this._xmlNode.getAttribute('id');
      }
    } else {
      item.type = '';
    }
    return item;
  }
}
