import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIURL } from '../api/url';

interface Language {
  id: string;
  type: string;
  attributes: {
    code: string;
    name: string;
    direction: string;
  };
}

interface Book {
  id: string;
  type: string;
  attributes: {
    abbreviation: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  allBooks: Book[] = [];
  allLanguages: Language[] = [];
  selectedLan: Language;
  constructor(public http: HttpClient) {}

  getBooks(url: string) {
    return this.http.get(url);
  }

  getLanguages(url: string) {
    return this.http.get(url);
  }

  downloadFile(url: string) {
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

  createSubscriber(data: {
    data: {
      type: string;
      attributes: {
        name: string;
        email: string;
        language_id: number;
        destination_id: number;
      };
    };
  }) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/vnd.api+json' })
    };

    return this.http.post(APIURL.POST_CREATE_SUBSCRIBER, data, httpOptions);
  }
}
