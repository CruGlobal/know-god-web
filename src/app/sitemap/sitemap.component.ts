import { Component, OnInit } from '@angular/core';
import { CommonService } from '../services/common.service';
import { APIURL } from '../api/url';
import FileSaver from 'file-saver';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.css']
})

export class SitemapComponent implements OnInit {
  allBooks: any;
  allLanguages = {};
  sitemap = '';
  allTranslations: any;

  constructor(public commonService: CommonService) {
    this.getAllLanguages();
  }

  ngOnInit() {
  }

  downloadFile(data: any) {
    const file = new File([data], 'sitemap.txt', {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(file);
  }

  getAllBooks() {
    this.commonService.getBooks(APIURL.GET_ALL_BOOKS + '?include=latest-translations')
    .subscribe((data: any) => {
      this.allBooks = data.data;
      this.allTranslations = data.included.filter(row => row.type === 'translation');
      this.generateSitemap();
      this.downloadFile(this.sitemap);
    });
  }

  // Generates URLs for all books, languages & pages
  private generateSitemap() {
    this.allBooks.forEach(b => {
      b.relationships['latest-translations'].data.forEach(t => {
        const translationId = this.allTranslations.filter(row => row.id === t.id)[0];
        const language = this.allLanguages[translationId.relationships.language.data.id];

        for (let i = 0; i < b.relationships.pages.data.length; i++) {
          this.sitemap += 'https://knowgod.com/' + language + '/' + b.attributes.abbreviation + (i > 0 ? i : '') + '\n';
        }
      });
    });
  }

  getAllLanguages() {
    this.commonService.getLanguages(APIURL.GET_ALL_LANGUAGES)
    .subscribe((data: any) => {
      data.data.forEach(language => {
        this.allLanguages[language.id] = language.attributes.code;
      });
      this.getAllBooks();
    });
  }
}
