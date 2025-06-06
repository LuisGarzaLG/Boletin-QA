import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { LoginComponent } from './login/login.component';
import { NbSpinnerModule, NbToastrModule } from '@nebular/theme';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
//import { EditComponent } from './edit/edit.component';

@NgModule({
  declarations: [
    PagesComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    NbSpinnerModule,
    ReactiveFormsModule,
    RouterModule,
    PagesRoutingModule,
    HttpClientModule,
    NbToastrModule.forRoot(),
    
  ]
})
export class PagesModule { }
