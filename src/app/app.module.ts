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
import { ModalComponent } from './page/component/modal/modal.component';
import { CYOAComponent } from './page/component/page/cyoa-page/cyoa-page.component';
import { PageHeaderComponent } from './page/component/page-header/page-header.component';
import { PageHeroComponent } from './page/component/page-hero/page-hero.component';
import { TractPageComponent } from './page/component/tract-page/tract-page.component';
import { PageComponent } from './page/page.component';
import { LoaderService } from './services/loader-service/loader.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { SharingModalComponent } from './shared/sharing-modal/sharing-modal.component';

const appRoutes: Routes = [
  {
    path: ':langid/:bookid',
    redirectTo: ':langid/:bookid/0',
    pathMatch: 'full'
  },
  { path: ':langid', component: DashboardComponent },
  { path: '', component: DashboardComponent },
  { path: ':langid/embed/:bookid', component: PageComponent },
  {
    path: ':langid/:bookid/:page',
    component: PageComponent
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
    SharingModalComponent,
    LoaderComponent,
    PageComponent,
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
    ContentRepeaterComponent,
    ContentMultiselectComponent,
    ContentMultiselectOptionComponent,
    ContentFlowComponent,
    ContentFlowItemComponent,
    ContentCardComponent,
    CYOAComponent
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
