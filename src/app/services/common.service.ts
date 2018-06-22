import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import {Headers, RequestOptions} from '@angular/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  headers: HttpHeaders;
  options: any;
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
    console.log(this.headers.get('Accept'))
    console.log("Headers:", this.headers);
   
     
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
