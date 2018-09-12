import { Component, OnInit } from '@angular/core';
import { LoaderService } from './services/loader-service/loader.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showLoader: boolean;

  constructor(private loaderService: LoaderService, private router: Router){}

  ngOnInit() {
    this.loaderService.status.subscribe((val: boolean) => {
      this.showLoader = val;
    });

    // analytics events
    if(CustomEvent !== undefined){
      (<any>window).digitalData = { page: {} };
      this.router.events
        .subscribe((event) => {
          if (event instanceof NavigationEnd) {
            const pathParts = event.url.split('/');
            pathParts[0] = 'know god';
            (<any>window).digitalData.page = {
              pageInfo: {
                pageName: pathParts[0] + ' : ' + (pathParts[2] || 'home'),
                language: pathParts[1]
              },
              category: {
                primaryCategory: pathParts[2]
              }
            };

            const evt = new CustomEvent('content: all pages');
            document.querySelector('body').dispatchEvent(evt);
          }
        });
    }
  }
}
