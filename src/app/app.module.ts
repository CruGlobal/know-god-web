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

const appRoutes: Routes = [
  {
    path: 'page/new/rendered/:langid/:bookid/:page',
    component: PageNewComponent
  },
  { path: 'page/new/rendered/:langid/:bookid', component: PageNewComponent },
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
    PageNewComponent
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
