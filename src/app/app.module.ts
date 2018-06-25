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
import { SharingModalComponent } from './shared/sharing-modal/sharing-modal.component';

const appRoutes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },

  {
    path: 'home',
    component: HeaderComponent,children:[
      {path:'/:langid',component:HomeComponent},
      {path:'/:langid/:bookid',component:PageComponent},
      {path:'/s:langid/:bookid/:pageid',component:PageComponent}
    ]
  },
  // {
  //   path: '',
  //   component: HeaderComponent,children:[
      
  //   ]
  // },
  // {
  //   path: 'home/:bookid',
  //   component: HomeComponent
  // },
  // {
  //   path: 'home/:bookid/:langid',
  //   component: PageComponent
  // },
  // },
  // {
  //   path: 'home/:bookid',
  //   component: PageComponent
  // },
  // {
  //   path: 'home/:bookid/:langid',
  //   component: PageComponent
  // },
  // {
  //   path: 'home/:bookid/:langid/:page',
  //   component: PageComponent
  // }

  // {
  //   path: 'home',
  //   component: PageComponent,
  //   children: [
  //     {
  //       path: 'home/:id',
  //       component: PageComponent,
  //       children: [
  //         {
  //           path: 'home/:book/:lang',
  //           component: PageComponent,
  //           children: [
  //             { path: 'home/:book/:lang/:page', component: PageComponent }
  //           ]
  //         }
  //       ]
  //     }

  //   ]
  // },

]
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PageComponent,
    HomeComponent,
    SharingModalComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),


  ],
  providers: [CommonModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
