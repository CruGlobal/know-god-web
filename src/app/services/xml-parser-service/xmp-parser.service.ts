import { org, ManifestParser as manifestParser } from '@cruglobal/godtools-shared';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Text = org.cru.godtools.shared.tool.parser.model.Text
export type Content = org.cru.godtools.shared.tool.parser.model.Content
export type Image = org.cru.godtools.shared.tool.parser.model.Image
export type Page = org.cru.godtools.shared.tool.parser.model.page.Page
export type CallToAction = org.cru.godtools.shared.tool.parser.model.tract.CallToAction
export type Header = org.cru.godtools.shared.tool.parser.model.tract.Header
export type Hero = org.cru.godtools.shared.tool.parser.model.tract.Hero
export type Modal = org.cru.godtools.shared.tool.parser.model.tract.Modal
export type TractPage = org.cru.godtools.shared.tool.parser.model.tract.TractPage
export type Card = org.cru.godtools.shared.tool.parser.model.tract.TractPage.Card
export type Parent = org.cru.godtools.shared.tool.parser.model.Parent
export type Paragraph = org.cru.godtools.shared.tool.parser.model.Paragraph
export type Resource = org.cru.godtools.shared.tool.parser.model.Resource
export type Manifest = org.cru.godtools.shared.tool.parser.model.Manifest
export type XmlParserData = org.cru.godtools.shared.tool.parser.ParserResult.Data
export namespace XmlParser {
  export const ParserConfig = org.cru.godtools.shared.tool.parser.ParserConfig
  export const ManifestParser = manifestParser
}


export const ContentParser = (content: any): string => {
  if (content instanceof org.cru.godtools.shared.tool.parser.model.Image) {
    console.log('CONTENT: Image')
    return 'image'
  } else if (content instanceof org.cru.godtools.shared.tool.parser.model.Text) {
    console.log('CONTENT: Text')
    return 'text'
  } else if (content instanceof org.cru.godtools.shared.tool.parser.model.Paragraph) {
    console.log('CONTENT: Paragraph')
    return 'paragraph'
  } else if (content instanceof org.cru.godtools.shared.tool.parser.model.tract.Modal) {
    console.log('CONTENT: Modal')
    return ''
  } else if (content instanceof org.cru.godtools.shared.tool.parser.model.tract.TractPage.Card) {
    console.log('CONTENT: Card')
    return ''
  } else if (content instanceof org.cru.godtools.shared.tool.parser.model.Resource) {
    console.log('CONTENT: Resource')
    return ''
  } else if (content instanceof org.cru.godtools.shared.tool.parser.model.tract.Header) {
    console.log('CONTENT: Header')
    return ''
  } else {
    console.log('CONTENT: Unknown')
    return ''
    // throw new Error('Unknown element')
  }
}

export type ContentItems = Image | Text | Paragraph | Resource

export type ContentItemsType = {
  type: string,
  content: ContentItems
}

@Injectable({
  providedIn: 'root'
})
export class PullParserFactory extends org.cru.godtools.shared.tool.parser.xml.JsXmlPullParserFactory {
  _fileOrigin: string;
  clearOrigin() {
    this._fileOrigin = '';
  }
  setOrigin(file: string) {
    this._fileOrigin = file.match(/^.*[\\\/]/)[0] || '';
  }
  getOrigin() {
    return this._fileOrigin
  }

  constructor(public http: HttpClient) {super()}
  async readFile(fileName: string): Promise<string> {
    fileName = fileName?.includes('http')? fileName : `${this.getOrigin() + fileName}`;
    return new Promise(resolve=>{
      this.http.get(fileName, { responseType: 'arraybuffer' }).subscribe((data: any) => {
        const enc = new TextDecoder('utf-8');
        const arr = new Uint8Array(data);
        const result = enc.decode(arr);
        resolve(result);
      })
    }) 
  }
}