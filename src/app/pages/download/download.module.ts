import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeleteRoutingModule } from '../delete/delete-routing.module';
import { DownloadComponent } from './download.component';
import { NbDatepickerModule,NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbSpinnerModule, NbTabsetModule, NbThemeModule, NbToastrModule, NbListModule, NbSelectModule, NbFormFieldModule } from '@nebular/theme';
import { Modelo1Component } from './modelo1/modelo1.component';
import { Modelo2Component } from './modelo2/modelo2.component';



@NgModule({
  declarations: [
    DownloadComponent,
    Modelo1Component,
    Modelo2Component
  ],
  imports: [
    FormsModule,
    NbFormFieldModule,
    ReactiveFormsModule, 
    CommonModule,
    DeleteRoutingModule,
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
  ],
  exports: [Modelo1Component, Modelo2Component]
})
export class DownloadModule { }
