import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

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
    window.digitalData = {};
  }

  subscribeToRouterEvents() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const [_domain, language, pageName, pageNumber] = event.url.split('/');

        this.setDigitalData(pageName || 'knowgod', language, pageNumber);

        // Google Analytics
        window.dataLayer.push({
          event: 'virtual-page-view'
        });
      }
    });
  }

  setDigitalData(appName: string, language: string, pageNumber?: string) {
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
}
