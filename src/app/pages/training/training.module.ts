import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrainingRoutingModule } from './training-routing.module';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbSpinnerModule, NbTabsetModule, NbThemeModule, NbToastrModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainingComponent } from './training.component';
import { DownloadModule } from '../download/download.module';

@NgModule({
  declarations: [
    TrainingComponent,
  ], 
  imports: [
    CommonModule,
    TrainingRoutingModule,
    NbThemeModule.forRoot(),
    NbThemeModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbSpinnerModule,
    NbIconModule,
    NbTabsetModule,
    NbToastrModule.forRoot(),
    Ng2SmartTableModule,
    ReactiveFormsModule,
    DownloadModule,
    FormsModule
  ]
})
export class TrainingModule { }