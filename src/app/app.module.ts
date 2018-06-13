import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PageComponent } from './page/page.component';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  { path:"", redirectTo:"home", pathMatch:"full" },
  { path: 'home', component:PageComponent },
  { path: 'home/:book', component:PageComponent  },
  { path: 'home/:book/:lang', component:PageComponent  },
  { path: 'home/:book/:lang/:page', component:PageComponent  }
]
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PageComponent
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
