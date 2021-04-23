import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PageComponent } from './page/page.component';
import { RouterModule, Routes } from '@angular/router';
import { SharingModalComponent } from './shared/sharing-modal/sharing-modal.component';
import { HttpModule } from '@angular/http';
import { LoaderService } from './services/loader-service/loader.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { ToastrModule } from 'ngx-toastr';
import { PageNewComponent } from './page-new/page-new.component';
import { PageRecursiveComponent } from './page-recursive/page-recursive.component';
import { PageHeaderComponent } from './page-recursive/component/page-header/page-header.component';
import { TractPageComponent } from './page-recursive/component/tract-page/tract-page.component';
import { PageHeroComponent } from './page-recursive/component/page-hero/page-hero.component';
import { ContentImageComponent } from './page-recursive/component/content-image/content-image.component';
import { ContentParagraphComponent } from './page-recursive/component/content-paragraph/content-paragraph.component';
import { ContentFormComponent } from './page-recursive/component/content-form/content-form.component';
import { CardComponent } from './page-recursive/component/card/card.component';
import { ContentTextComponent } from './page-recursive/component/content-text/content-text.component';
import { ContentButtonComponent } from './page-recursive/component/content-button/content-button.component';
import { ContentLinkComponent } from './page-recursive/component/content-link/content-link.component';
import { ContentInputComponent } from './page-recursive/component/content-input/content-input.component';
import { ContentVideoComponent } from './page-recursive/component/content-video/content-video.component';
import { ContentTabsComponent } from './page-recursive/component/content-tabs/content-tabs.component';
import { ContentAccordionComponent } from './page-recursive/component/content-accordion/content-accordion.component';
import { ContentAnimationComponent } from './page-recursive/component/content-animation/content-animation.component';
import { CalltoactionComponent } from './page-recursive/component/calltoaction/calltoaction.component';
import { ModalComponent } from './page-recursive/component/modal/modal.component';
import { ContentSpacerComponent } from './page-recursive/component/content-spacer/content-spacer.component';
import { TrainingTipComponent } from './page-recursive/component/training-tip/training-tip.component';

const appRoutes: Routes = [
  {
    path: 'page/new/rendered/:langid/:bookid/:page',
    component: PageNewComponent
  },
  { path: 'page/new/rendered/:langid/:bookid', component: PageNewComponent },
  {
    path: 'page/new/recursive/:langid/:bookid/:page', component: PageRecursiveComponent
  },
  { 
    path: 'page/new/recursive/:langid/:bookid', 
    redirectTo: 'page/new/recursive/:langid/:bookid/0',
    pathMatch: 'full' 
  },  
  { path: ':langid/embed/:bookid', component: PageComponent },
  { path: ':langid/:bookid/:page', component: PageComponent },
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
    PageComponent,
    SharingModalComponent,
    LoaderComponent,
    PageNewComponent,
    PageRecursiveComponent,
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
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled' // Scrolls to top when fragment is removed
    }),
    BrowserAnimationsModule,
    ToastrModule.forRoot()
  ],
  providers: [CommonModule, LoaderService],
  bootstrap: [AppComponent]
})
export class AppModule {}
