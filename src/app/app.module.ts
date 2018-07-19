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
import { HomeComponent } from './home/home.component';
import { LoadingModule } from 'ngx-loading';
import { SharingModalComponent } from './shared/sharing-modal/sharing-modal.component';
import { HttpModule } from '@angular/http';
import { LoaderService } from './services/loader-service/loader.service';
import { LoaderComponent } from './shared/loader/loader.component'; 
import {ToastrModule } from 'ngx-toastr';
//import { CustomOption } from './shared/custom-options';
 

const appRoutes: Routes =[
  { path: 'home/:bookid/:langid/:page', component: PageComponent },
  { path: 'home/:bookid/:langid', component: PageComponent},
  { path: 'home/:bookid', component: PageComponent},
  { path: 'base', component: HeaderComponent} ,
  { path: '', redirectTo: '/base', pathMatch: 'full'} ,
  { path: "", redirectTo: '/base', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PageComponent,
    HomeComponent,
    SharingModalComponent,  
    LoaderComponent  
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    LoadingModule,
    HttpModule,
    RouterModule.forRoot(appRoutes) ,
    BrowserAnimationsModule,
    ToastrModule.forRoot() ,
    
  ],
  providers: [
    CommonModule,
    LoaderService, 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
