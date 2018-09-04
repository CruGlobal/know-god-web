import { Component } from '@angular/core';
import { CommonService } from '../services/common.service';
import { APIURL } from '../api/url';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    Images = [];
    englishLangId = 1;

    constructor(public route: Router,
        public commonService: CommonService,
    ) {
        // fetch all books
        this.getAttachments();
    }

  getAttachments() {
    const url = APIURL.GET_ALL_BOOKS + '?include=latest-translations,attachments';
    this.commonService.getBooks(url)
      .subscribe((data: any) => {
        const attachments = data.included.filter(included => included.type === 'attachment');
        const englishTranslations = data.included.filter(
          included => included.type === 'translation' && Number(included.relationships.language.data.id) === this.englishLangId
        );

        data.data.forEach(resource => {
          if (resource.attributes['resource-type'] !== 'tract') {
            return;
          }

          const resourceId = resource.id;
          const bannerId = resource.attributes['attr-banner'];

          this.Images.push({
            ImgUrl: attachments.find(x => x.id === bannerId).attributes.file,
            resource: resource.attributes.name,
            id: resourceId,
            abbreviation: resource.attributes.abbreviation,
            tagline: englishTranslations.find(x => x.relationships.resource.data.id === resourceId).attributes['translated-tagline']
          });
        });
      });
  }

  navigateToPage(abbreviation) {
    this.route.navigateByUrl('en/' + abbreviation);
  }

}