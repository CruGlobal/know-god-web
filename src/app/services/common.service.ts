import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


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

}
