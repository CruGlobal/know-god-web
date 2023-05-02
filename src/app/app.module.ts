import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { LottieAnimationViewModule } from 'ng-lottie';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { SharingModalComponent } from './shared/sharing-modal/sharing-modal.component';
import { LoaderService } from './services/loader-service/loader.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { PageComponent } from './page/page.component';
import { PageHeaderComponent } from './page/component/page-header/page-header.component';
import { TractPageComponent } from './page/component/tract-page/tract-page.component';
import { PageHeroComponent } from './page/component/page-hero/page-hero.component';
import { ContentImageComponent } from './page/component/content-image/content-image.component';
import { ContentParagraphComponent } from './page/component/content-paragraph/content-paragraph.component';
import { ContentFormComponent } from './page/component/content-form/content-form.component';
import { CardComponent } from './page/component/card/card.component';
import { ContentTextComponent } from './page/component/content-text/content-text.component';
import { ContentButtonComponent } from './page/component/content-button/content-button.component';
import { ContentLinkComponent } from './page/component/content-link/content-link.component';
import { ContentInputComponent } from './page/component/content-input/content-input.component';
import { ContentVideoComponent } from './page/component/content-video/content-video.component';
import { ContentTabsComponent } from './page/component/content-tabs/content-tabs.component';
import { ContentAccordionComponent } from './page/component/content-accordion/content-accordion.component';
import { ContentAnimationComponent } from './page/component/content-animation/content-animation.component';
import { CalltoactionComponent } from './page/component/calltoaction/calltoaction.component';
import { ModalComponent } from './page/component/modal/modal.component';
import { ContentSpacerComponent } from './page/component/content-spacer/content-spacer.component';
import { TrainingTipComponent } from './page/component/training-tip/training-tip.component';
import { ContentFallbackComponent } from './page/component/content-fallback/content-fallback.component';
import { PageNewComponent } from './new-page/page.component';
import { PageHeaderNewComponent } from './new-page/component/page-header/page-header.component';
import { TractPageNewComponent } from './new-page/component/tract-page/tract-page.component';
import { PageHeroNewComponent } from './new-page/component/page-hero/page-hero.component';
import { ContentImageNewComponent } from './new-page/component/content-image/content-image.component';
import { ContentParagraphNewComponent } from './new-page/component/content-paragraph/content-paragraph.component';
import { ContentFormNewComponent } from './new-page/component/content-form/content-form.component';
import { CardNewComponent } from './new-page/component/card/card.component';
import { ContentTextNewComponent } from './new-page/component/content-text/content-text.component';
import { ContentButtonNewComponent } from './new-page/component/content-button/content-button.component';
import { ContentLinkNewComponent } from './new-page/component/content-link/content-link.component';
import { ContentInputNewComponent } from './new-page/component/content-input/content-input.component';
import { ContentVideoNewComponent } from './new-page/component/content-video/content-video.component';
import { ContentTabsNewComponent } from './new-page/component/content-tabs/content-tabs.component';
import { ContentAccordionNewComponent } from './new-page/component/content-accordion/content-accordion.component';
import { ContentAnimationNewComponent } from './new-page/component/content-animation/content-animation.component';
import { CalltoactionNewComponent } from './new-page/component/calltoaction/calltoaction.component';
import { ModalNewComponent } from './new-page/component/modal/modal.component';
import { ContentSpacerNewComponent } from './new-page/component/content-spacer/content-spacer.component';
import { TrainingTipNewComponent } from './new-page/component/training-tip/training-tip.component';
import { ContentFallbackNewComponent } from './new-page/component/content-fallback/content-fallback.component';
import { ContentRepeaterNewComponent } from './new-page/component/content-repeater/content-repeater.component';

const appRoutes: Routes = [
  { path: 'old/:langid/embed/:bookid', component: PageComponent },
  {
    path: 'old/:langid/:bookid/:page',
    component: PageComponent
  },
  {
    path: ':langid/:bookid',
    redirectTo: ':langid/:bookid/0',
    pathMatch: 'full'
  },
  { path: ':langid', component: HeaderComponent },
  { path: '', component: HeaderComponent },
  { path: ':langid/embed/:bookid', component: PageNewComponent },
  {
    path: ':langid/:bookid/:page',
    component: PageNewComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SharingModalComponent,
    LoaderComponent,
    PageComponent,
    PageNewComponent,
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
    ContentFallbackComponent,
    PageHeaderNewComponent,
    TractPageNewComponent,
    PageHeroNewComponent,
    ContentImageNewComponent,
    ContentParagraphNewComponent,
    ContentFormNewComponent,
    CardNewComponent,
    ContentTextNewComponent,
    ContentButtonNewComponent,
    ContentLinkNewComponent,
    ContentInputNewComponent,
    ContentVideoNewComponent,
    ContentTabsNewComponent,
    ContentAccordionNewComponent,
    ContentAnimationNewComponent,
    CalltoactionNewComponent,
    ModalNewComponent,
    ContentSpacerNewComponent,
    TrainingTipNewComponent,
    ContentFallbackNewComponent,
    ContentRepeaterNewComponent
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
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right'
    }),
    LottieAnimationViewModule.forRoot()
  ],
  providers: [CommonModule, LoaderService],
  bootstrap: [AppComponent]
})
export class AppModule {}
