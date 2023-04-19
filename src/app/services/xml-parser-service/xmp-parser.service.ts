import * as Parser from '@cruglobal/godtools-shared';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

type Nullable<T> = T | null | undefined
@Injectable()
export class PullParserFactory extends Parser.org.cru.godtools.shared.tool.parser.xml.JsXmlPullParserFactory {
  constructor(public http: HttpClient) {super()}
  async readFile(fileName: string): Promise<string> {
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


// export class ParserConfiguration extends Parser.org.cru.godtools.shared.tool.parser.ParserConfig {
//   constructor() {super()}
//   static createParserConfig() {

//   }
//   withSupportedFeatures(feature: Array<string>) {

//   }
//   withParseRelated(enabled: boolean) {

//   }
//   withParsePages(enabled: boolean) {

//   }
//   withParseTips(enabled: boolean) {

//   }
//   copy(
//     deviceType?: any,
//     appVersion?: Nullable<any>,
//     supportedFeatures?: any,
//     parsePages?: boolean,
//     parseTips?: boolean,
//     parserDispatcher?: any) {
//   }
//   toString() {

//   }
//   hashCode() {

//   }
//   equals(other: Nullable<any>) {

//   }
// }