import { Injectable } from '@angular/core';
import { LoaderService } from './loader-service/loader.service';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private loaderService: LoaderService, private router: Router){
    (<any>window).digitalData = { page: {} };
  }

  runAnalyticsInsidePages(url) {
    const [_, language, pageName, pageNumber ] = url.split('/');
    this.setDigitalData(pageName || 'knowgod', language, pageNumber);

    if (CustomEvent !== undefined) {
      const evt = new CustomEvent('content: all pages');
      document.querySelector('body').dispatchEvent(evt);
    }
  }

  runAnalyticsOnHomepages() {
    if (CustomEvent !== undefined) {
      this.router.events
        .subscribe((event) => {
          if (event instanceof NavigationEnd) {
            const [_, language, pageName ] = event.url.split('/');
            this.setDigitalData(pageName || 'knowgod', language);

            const evt = new CustomEvent('content: all pages');
            document.querySelector('body').dispatchEvent(evt);
          }
        });
    }
  }

  setDigitalData(appName, language, pageNumber?) {
    (<any>window).digitalData.page = {
      pageInfo: {
        pageName: `${appName} : ${pageNumber || 'home'}`,
        language: language || 'en',
        embedded: (<any>window).isEmbedded === true ? 'embed' : ''
      },
      category: {
        primaryCategory: appName
      }
    };
  }

}
