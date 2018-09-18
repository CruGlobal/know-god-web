import { Component, OnInit } from '@angular/core';
import { LoaderService } from './services/loader-service/loader.service';
import { Router, NavigationEnd } from '@angular/router';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showLoader: boolean;

  constructor(private loaderService: LoaderService,
    private analyticsService: AnalyticsService,
  ){}

  ngOnInit() {
    this.loaderService.status.subscribe((val: boolean) => {
      this.showLoader = val;
    });

    this.analyticsService.runAnalytics();
  }
}
