import {org, ManifestParser} from '@cruglobal/godtools-shared';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

type Nullable<T> = T | null | undefined
@Injectable({
  providedIn: 'root'
})

// export class xmlParser {
//   state: {
//   }
// }


// export class ParserState extends org.cru.godtools.shared.tool.state {
//   constructor() {super()}
//   loadedFiles: Array<string> = [];

//   set addFile(file: string) {
//     if (!file) throw new Error('Must include file.')
//     this.loadedFiles.push(file)
//   }
  
// }


export class PullParserFactory extends org.cru.godtools.shared.tool.parser.xml.JsXmlPullParserFactory {
  constructor(public http: HttpClient) {super()}
  async readFile(fileName: string): Promise<string> {
    fileName = fileName?.includes('http')? fileName : `https://s3.amazonaws.com/know-god-assets/6130/${fileName}`;
    console.log('READ File', fileName, 'END')
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

export class ParserConfig {
  withSupportedFeatures(feature: Array<string>): org.cru.godtools.shared.tool.parser.ParserConfig {
    console.log('ParserConfig.withParseRelated')
    return new ParserConfig
  }
  withParseRelated(enabled: boolean): org.cru.godtools.shared.tool.parser.ParserConfig {
    console.log('ParserConfig.withParseRelated')
    return new ParserConfig
  }
  withParsePages(enabled: boolean): org.cru.godtools.shared.tool.parser.ParserConfig {
    console.log('ParserConfig.withParsePages')
    return new ParserConfig
  }
  withParseTips(enabled: boolean): org.cru.godtools.shared.tool.parser.ParserConfig {
    console.log('ParserConfig.withParseTips')
    return new ParserConfig
  }
  copy(
    deviceType?: any,
    appVersion?: Nullable<any>,
    supportedFeatures?: any,
    parsePages?: boolean,
    parseTips?: boolean,
    parserDispatcher?: any
  ): org.cru.godtools.shared.tool.parser.ParserConfig {
    console.log('ParserConfig.copy')
    return
  }
  toString(): string {
    console.log('ParserConfig.toString')
    return toString()
  }
  hashCode(): number {
    console.log('ParserConfig.hashCode')
    return 10
  }
  equals(other: Nullable<any>): boolean {
    console.log('ParserConfig.equals')
    return !!other
  }
}