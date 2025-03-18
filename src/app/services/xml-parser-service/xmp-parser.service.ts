import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ManifestParser as manifestParser,
  org
} from '@cruglobal/godtools-shared';

export type Text = org.cru.godtools.shared.tool.parser.model.Text;
export type Content = org.cru.godtools.shared.tool.parser.model.Content;
export type Image = org.cru.godtools.shared.tool.parser.model.Image;
export type Page = org.cru.godtools.shared.tool.parser.model.page.Page;
export type CallToAction =
  org.cru.godtools.shared.tool.parser.model.tract.CallToAction;
export type Header = org.cru.godtools.shared.tool.parser.model.tract.Header;
export type Hero = org.cru.godtools.shared.tool.parser.model.tract.Hero;
export type Modal = org.cru.godtools.shared.tool.parser.model.tract.Modal;
export type TractPage =
  org.cru.godtools.shared.tool.parser.model.tract.TractPage;
export type TractPageCard =
  org.cru.godtools.shared.tool.parser.model.tract.TractPage.Card & {
    // isHidden is a default property of Card and can't be edited
    // isTemporarilyHidden is a new property that can be edited to prevent us from type casting.
    isTemporarilyHidden?: boolean;
  };
export type CyoaContentPage =
  org.cru.godtools.shared.tool.parser.model.page.ContentPage;
export type CyoaCardCollectionPage =
  org.cru.godtools.shared.tool.parser.model.page.CardCollectionPage;
export type CyoaPageCollectionPage =
  org.cru.godtools.shared.tool.parser.model.page.PageCollectionPage;

export type CYOAPage =
  | CyoaContentPage
  | CyoaCardCollectionPage
  | CyoaPageCollectionPage;
export type CYOAPageCard =
  org.cru.godtools.shared.tool.parser.model.page.CardCollectionPage.Card;
export type Parent = org.cru.godtools.shared.tool.parser.model.Parent;
export type Paragraph = org.cru.godtools.shared.tool.parser.model.Paragraph;
export type Resource = org.cru.godtools.shared.tool.parser.model.Resource;
export type Manifest = org.cru.godtools.shared.tool.parser.model.Manifest;
export type XmlParserData =
  org.cru.godtools.shared.tool.parser.ParserResult.Data;
export type Video = org.cru.godtools.shared.tool.parser.model.Video;
export type Button = org.cru.godtools.shared.tool.parser.model.Button;
export type EventId = org.cru.godtools.shared.tool.parser.model.EventId;
export type Form = org.cru.godtools.shared.tool.parser.model.Form;
export type Input = org.cru.godtools.shared.tool.parser.model.Input;
export type Link = org.cru.godtools.shared.tool.parser.model.Link;
export type Animation = org.cru.godtools.shared.tool.parser.model.Animation;
export type Tabs = org.cru.godtools.shared.tool.parser.model.Tabs;
export type Tab = org.cru.godtools.shared.tool.parser.model.Tabs.Tab;

// TODO - Need to implement the below 6 types into components
export type Spacer = org.cru.godtools.shared.tool.parser.model.Spacer;
export type Accordion = org.cru.godtools.shared.tool.parser.model.Accordion;
export type AccordionSection =
  org.cru.godtools.shared.tool.parser.model.Accordion.Section;
export type Card = org.cru.godtools.shared.tool.parser.model.Card;
export type Multiselect = org.cru.godtools.shared.tool.parser.model.Multiselect;
export type MultiselectOption =
  org.cru.godtools.shared.tool.parser.model.Multiselect.Option;
export type Flow = org.cru.godtools.shared.tool.parser.model.Flow;
export type FlowItem = org.cru.godtools.shared.tool.parser.model.Flow.Item;
export type Dimension = org.cru.godtools.shared.tool.parser.model.Dimension;
export type FlowWatcher = org.cru.godtools.shared.tool.parser.util.FlowWatcher;
export const ParserConfig = org.cru.godtools.shared.tool.parser.ParserConfig;
export const ManifestParser = manifestParser;
export const State = org.cru.godtools.shared.tool.state.State;

export const ContentParser = (content: any): string => {
  if (content instanceof org.cru.godtools.shared.tool.parser.model.Image) {
    // console.log('CONTENT: Image');
    return 'image';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Text
  ) {
    // console.log('CONTENT: Text');
    return 'text';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Paragraph
  ) {
    // console.log('CONTENT: Paragraph');
    return 'paragraph';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Video
  ) {
    // console.log('CONTENT: Video');
    return 'video';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Button
  ) {
    // console.log('CONTENT: Button');
    return 'button';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Form
  ) {
    // console.log('CONTENT: Form');
    return 'form';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Input
  ) {
    // console.log('CONTENT: Input');
    return 'input';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Spacer
  ) {
    // console.log('CONTENT: Spacer');
    return 'spacer';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Link
  ) {
    // console.log('CONTENT: Link');
    return 'link';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Tabs
  ) {
    // console.log('CONTENT: Tabs');
    return 'tabs';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Accordion
  ) {
    // console.log('CONTENT: Accordion');
    return 'accordion';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Card
  ) {
    // console.log('CONTENT: Card');
    return 'card';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Animation
  ) {
    // console.log('CONTENT: Animation');
    return 'animation';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Multiselect
  ) {
    // console.log('CONTENT: multiselect')
    return 'multiselect';
  } else if (
    content instanceof org.cru.godtools.shared.tool.parser.model.Flow
  ) {
    // console.log('CONTENT: Flow');
    return 'flow';
  } else {
    // console.log('CONTENT: Unknown');
    return '';
  }
};

interface DimensionParser {
  type: string;
  symbol: string;
  value: number;
}
export const DimensionParser = (dimension: any): DimensionParser => {
  let type = null,
    symbol = null,
    value = null;
  if (
    dimension instanceof
    org.cru.godtools.shared.tool.parser.model.Dimension.Percent
  ) {
    type = 'percent';
    symbol = '%';
    value = dimension.value * 100;
  } else if (
    dimension instanceof
    org.cru.godtools.shared.tool.parser.model.Dimension.Pixels
  ) {
    type = 'pixel';
    symbol = 'px';
    value = dimension.value;
  }
  return {
    type,
    symbol,
    value
  };
};

export type ContentItems =
  | Image
  | Text
  | Paragraph
  | Resource
  | Video
  | Button
  | Form
  | Input
  | Spacer
  | Link
  | Tabs
  | Accordion
  | Card
  | Animation
  | Multiselect
  | Flow;

export type ContentItemsType = {
  type: string;
  content: ContentItems | Content;
};

export const parseTextAddBrTags = (text: string): string => {
  if (!text) return '';
  return text.trim().replace(/[\n\r]/g, '<br/>');
};
export const parseTextRemoveBrTags = (text: string): string => {
  if (!text) return '';
  return text.trim().replace(/<br\s*[\/]?>/gi, ' ');
};

@Injectable({
  providedIn: 'root'
})
export class PullParserFactory extends org.cru.godtools.shared.tool.parser.xml
  .JsXmlPullParserFactory {
  _fileOrigin: string;
  clearOrigin() {
    this._fileOrigin = '';
  }
  setOrigin(file: string) {
    this._fileOrigin = file.match(/^.*[\\\/]/)[0] || '';
  }
  getOrigin() {
    return this._fileOrigin;
  }

  constructor(public http: HttpClient) {
    super();
  }
  async readFile(fileName: string): Promise<string> {
    fileName = fileName?.includes('http')
      ? fileName
      : `${this.getOrigin() + fileName}`;
    return new Promise((resolve) => {
      this.http
        .get(fileName, { responseType: 'arraybuffer' })
        .subscribe((data: any) => {
          const enc = new TextDecoder('utf-8');
          const arr = new Uint8Array(data);
          const result = enc.decode(arr);
          resolve(result);
        });
    });
  }
}
