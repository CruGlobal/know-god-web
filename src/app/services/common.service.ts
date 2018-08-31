import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  headers: HttpHeaders;
  options: any;
  allBooks=[];
  allLanguages=[];
  currenturl:Subject<any>;
  getCurrentUrl:Subject<any>
  selectedLan:any;
  constructor(public http: HttpClient) {
    this.headers = new HttpHeaders({
      'Accept': 'application/xml, image/png, image/jpeg, image/jpg, image/gif, text/html,application/xhtml+xml',
      //'Accept': 'application/octet-stream',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'GET , OPTIONS, POST',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      "Access-Control-Expose-Headers": "Access-Control-*",
      'Access-Control-Allow-Headers': "X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding"

    });
    this.currenturl=new Subject<any>()

  }
  getBooks(url) {
    return this.http.get(url);
  }

  getLanguages(url) {
    return this.http.get(url);
  }

  downloadFile(url) {
    return this.http.get(url,{ headers: this.headers, responseType:"arraybuffer"});
  }

}
