import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { LottieModule } from 'ngx-lottie';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CalltoactionComponent } from './page/component/calltoaction/calltoaction.component';
import { CardComponent } from './page/component/card/card.component';
import { ContentAccordionComponent } from './page/component/content-accordion/content-accordion.component';
import { ContentAnimationComponent } from './page/component/content-animation/content-animation.component';
import { ContentButtonComponent } from './page/component/content-button/content-button.component';
import { ContentCardComponent } from './page/component/content-card/content-card.component';
import { ContentFlowComponent } from './page/component/content-flow/content-flow.component';
import { ContentFlowItemComponent } from './page/component/content-flow-item/content-flow-item.component';
import { ContentFormComponent } from './page/component/content-form/content-form.component';
import { ContentImageComponent } from './page/component/content-image/content-image.component';
import { ContentInputComponent } from './page/component/content-input/content-input.component';
import { ContentLinkComponent } from './page/component/content-link/content-link.component';
import { ContentMultiselectComponent } from './page/component/content-multiselect/content-multiselect.component';
import { ContentMultiselectOptionComponent } from './page/component/content-multiselect-option/content-multiselect-option.component';
import { ContentParagraphComponent } from './page/component/content-paragraph/content-paragraph.component';
import { ContentRepeaterComponent } from './page/component/content-repeater/content-repeater.component';
import { ContentSpacerComponent } from './page/component/content-spacer/content-spacer.component';
import { ContentTabsComponent } from './page/component/content-tabs/content-tabs.component';
import { ContentTextComponent } from './page/component/content-text/content-text.component';
import { ContentVideoComponent } from './page/component/content-video/content-video.component';
import { CyoaCardComponent } from './page/component/cyoa/card/card.component';
import { DashboardListComponent } from './page/component/dashboard-list/dashboard-list.component';
import { ModalComponent } from './page/component/modal/modal.component';
import { CYOACardCollectionComponent } from './page/component/page/cyoa-card-collection-page/cyoa-card-collection-page.component';
import { CYOAComponent } from './page/component/page/cyoa-page/cyoa-page.component';
import { LessonComponent } from './page/component/page/lesson-page/lesson-page.component';
import { TractPageComponent } from './page/component/page/tract-page/tract-page.component';
import { PageHeaderComponent } from './page/component/page-header/page-header.component';
import { PageHeroComponent } from './page/component/page-hero/page-hero.component';
import { PageNavigationComponent } from './page/component/page-navigation/page-navigation.component';
import { PageComponent } from './page/page.component';
import { LoaderService } from './services/loader-service/loader.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { SharingModalComponent } from './shared/sharing-modal/sharing-modal.component';

//============
// Routes - The routes for the application
//
// :langId - The language ID
// :toolType - The tool type 'tool' or 'lesson'
// :resourceType - The resource type 'v1' for tract or 'v2' for cyoa
// :bookId - The book ID ('thefour', 'kgp', etc.)
// :page - The page number or name
// :cardPosition - The card position in the card collection
//============

const appRoutes: Routes = [
  { path: '', component: DashboardComponent },
  { path: ':langId', component: DashboardComponent },
  { path: ':langId/tools', component: DashboardComponent },
  { path: ':langId/lessons', component: DashboardComponent },
  {
    path: ':langId/embed/:toolType/:resourceType/:bookId',
    component: PageComponent
  },
  {
    path: ':langId/tool/:resourceType/:bookId/:page/:cardPosition',
    component: PageComponent
  },
  {
    path: ':langId/tool/:resourceType/:bookId/:page',
    component: PageComponent
  },
  {
    path: ':langId/tool/:resourceType/:bookId',
    component: PageComponent
  },
  {
    path: ':langId/lesson/:bookId/:page',
    component: PageComponent
  },
  {
    path: ':langId/lesson/:bookId',
    component: PageComponent
  },
  {
    path: ':langId/:bookId/:page',
    // Redirecting old URL format to the new one
    redirectTo: ':langId/tool/v1/:bookId/:page',
    pathMatch: 'full'
  },
  {
    path: ':langId/:bookId',
    // Redirecting old URL format to the new one
    redirectTo: ':langId/tool/v1/:bookId',
    pathMatch: 'full'
  }
];

// Lottie Web
// Need a separate function as it's required by the AOT compiler.
export function playerFactory() {
  return import(/* webpackChunkName: 'lottie-web' */ 'lottie-web');
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DashboardListComponent,
    SharingModalComponent,
    LoaderComponent,
    PageComponent,
    PageHeaderComponent,
    PageNavigationComponent,
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
    ContentRepeaterComponent,
    ContentMultiselectComponent,
    ContentMultiselectOptionComponent,
    ContentFlowComponent,
    ContentFlowItemComponent,
    ContentCardComponent,
    CyoaCardComponent,
    CYOAComponent,
    CYOACardCollectionComponent,
    LessonComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRoutes, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled' // Scrolls to top when fragment is removed
    }),
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right'
    }),
    LottieModule.forRoot({ player: playerFactory })
  ],
  providers: [CommonModule, LoaderService],
  bootstrap: [AppComponent]
})
export class AppModule {}
