import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PageComponent } from './page/page.component';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoadingModule } from 'ngx-loading';
import { SharingModalComponent } from './shared/sharing-modal/sharing-modal.component';
import { HttpModule } from '@angular/http';

const appRoutes: Routes =[
  { path: 'home/:bookid/:langid/:page', component: PageComponent },
  { path: 'home/:bookid/:langid', component: PageComponent},
  { path: 'home/:bookid', component: PageComponent},
  { path: 'base', component: HeaderComponent} ,
  { path: '', redirectTo: '/base', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PageComponent,
    HomeComponent,
    SharingModalComponent,    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    LoadingModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [CommonModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
