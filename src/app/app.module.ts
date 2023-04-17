import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PageV1Component } from './page-v1/page-v1.component';
import { RouterModule, Routes } from '@angular/router';
import { SharingModalComponent } from './shared/sharing-modal/sharing-modal.component';
// import { HttpClient } from '@angular/common/http';
import { LoaderService } from './services/loader-service/loader.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { ToastrModule } from 'ngx-toastr';
import { PageV2Component } from './page-v2/page-v2.component';
import { PageHeaderComponent } from './page-v2/component/page-header/page-header.component';
import { TractPageComponent } from './page-v2/component/tract-page/tract-page.component';
import { PageHeroComponent } from './page-v2/component/page-hero/page-hero.component';
import { ContentImageComponent } from './page-v2/component/content-image/content-image.component';
import { ContentParagraphComponent } from './page-v2/component/content-paragraph/content-paragraph.component';
import { ContentFormComponent } from './page-v2/component/content-form/content-form.component';
import { CardComponent } from './page-v2/component/card/card.component';
import { ContentTextComponent } from './page-v2/component/content-text/content-text.component';
import { ContentButtonComponent } from './page-v2/component/content-button/content-button.component';
import { ContentLinkComponent } from './page-v2/component/content-link/content-link.component';
import { ContentInputComponent } from './page-v2/component/content-input/content-input.component';
import { ContentVideoComponent } from './page-v2/component/content-video/content-video.component';
import { ContentTabsComponent } from './page-v2/component/content-tabs/content-tabs.component';
import { ContentAccordionComponent } from './page-v2/component/content-accordion/content-accordion.component';
import { ContentAnimationComponent } from './page-v2/component/content-animation/content-animation.component';
import { CalltoactionComponent } from './page-v2/component/calltoaction/calltoaction.component';
import { ModalComponent } from './page-v2/component/modal/modal.component';
import { ContentSpacerComponent } from './page-v2/component/content-spacer/content-spacer.component';
import { TrainingTipComponent } from './page-v2/component/training-tip/training-tip.component';
import { ContentFallbackComponent } from './page-v2/component/content-fallback/content-fallback.component';
import { LottieAnimationViewModule } from 'ng-lottie';

const appRoutes: Routes = [
  { path: 'page/v/1/:langid/:bookid/:page', component: PageV1Component },
  {
    path: 'page/v/1/:langid/:bookid',
    redirectTo: 'page/v/1/:langid/:bookid/0',
    pathMatch: 'full'
  },
  { path: ':langid/embed/:bookid', component: PageV2Component },
  {
    path: ':langid/:bookid/:page',
    component: PageV2Component
  },
  {
    path: ':langid/:bookid',
    redirectTo: ':langid/:bookid/0',
    pathMatch: 'full'
  },
  { path: ':langid', component: HeaderComponent },
  { path: '', component: HeaderComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PageV1Component,
    SharingModalComponent,
    LoaderComponent,
    PageV2Component,
    PageHeaderComponent,
    TractPageComponent,
    PageHeroComponent,
    ContentImageComponent,
    ContentParagraphComponent,
    ContentFormComponent,
    CardComponent,
    ContentTextComponent,
    ContentButtonComponent,
    ContentLinkComponent,
    ContentInputComponent,
    ContentVideoComponent,
    ContentTabsComponent,
    ContentAccordionComponent,
    ContentAnimationComponent,
    CalltoactionComponent,
    ModalComponent,
    ContentSpacerComponent,
    TrainingTipComponent,
    ContentFallbackComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRoutes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled', // Scrolls to top when fragment is removed
    relativeLinkResolution: 'legacy'
}),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    LottieAnimationViewModule.forRoot()
  ],
  providers: [CommonModule, LoaderService],
  bootstrap: [AppComponent]
})
export class AppModule {}
