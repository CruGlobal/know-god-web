import { Injectable } from '@angular/core';
import { LoaderService } from './loader-service/loader.service';
import { Router, NavigationEnd } from '@angular/router';

declare global {
  interface Window {
    dataLayer: { event: string }[];
    digitalData: {
      page?: {
        pageInfo: {
          pageName: string;
          language: string;
          embedded: 'embed' | '';
        };
        category: { primaryCategory: string };
      };
    };
    isEmbedded?: boolean;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private router: Router) {
    window.dataLayer = [];
    window.digitalData = {};
  }

  runAnalyticsInsidePages(url) {
    const [_, language, pageName, pageNumber] = url.split('/');
    this.setDigitalData(pageName || 'knowgod', language, pageNumber);

    this.fireAnalyticsVirtualPageView();
  }

  runAnalyticsOnHomepages() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const [_, language, pageName, pageNumber] = event.url.split('/');
        if (pageNumber === undefined) {
          this.setDigitalData(pageName || 'knowgod', language);

          this.fireAnalyticsVirtualPageView();
        }
      }
    });
  }

  setDigitalData(appName, language, pageNumber?) {
    window.digitalData.page = {
      pageInfo: {
        pageName: `${appName} : ${pageNumber || 'home'}`,
        language: language || 'en',
        embedded: window.isEmbedded === true ? 'embed' : ''
      },
      category: {
        primaryCategory: appName
      }
    };
  }

  fireAnalyticsVirtualPageView() {
    // Google Analytics
    window.dataLayer.push({
      event: 'virtual-page-view'
    });

    // Adobe Analytics
    if (CustomEvent !== undefined) {
      const evt = new CustomEvent('content: all pages');
      document.querySelector('body').dispatchEvent(evt);
    }
  }
}
