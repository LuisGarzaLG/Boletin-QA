import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Modelo1RoutingModule } from './modelo1-routing.module';
import { Modelo1Component } from './modelo1.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbListModule, NbSelectModule, NbSpinnerModule, NbTabsetModule, NbThemeModule, NbToastrModule } from '@nebular/theme';
import { DownloadComponent } from '../download.component';




@NgModule({
  declarations:
  [DownloadComponent ,Modelo1Component],

  imports: [
    Modelo1RoutingModule,
      FormsModule,
      NbFormFieldModule,
      ReactiveFormsModule, 
      CommonModule,
      NbDatepickerModule,
      NbListModule,
      NbThemeModule.forRoot(),
      NbThemeModule,
      NbInputModule,
      NbCardModule,
      NbButtonModule,
      NbSpinnerModule,
      NbIconModule,
      NbTabsetModule,
      NbSelectModule,
      NbToastrModule.forRoot()
    ]
  
})
export class Modelo1Module { }
