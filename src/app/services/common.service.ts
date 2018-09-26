import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APIURL } from '../api/url';
import { log } from 'util';


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  allBooks = [];
  allLanguages = [];
  selectedLan: any;
  constructor(public http: HttpClient) {}

  getBooks(url) {
    return this.http.get(url);
  }

  getLanguages(url) {
    return this.http.get(url);
  }

  downloadFile(url) {
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

  createSubscriber(data) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/vnd.api+json' })
    };

    return this.http.post(APIURL.POST_CREATE_SUBSCRIBER, data, httpOptions)
  }
}
