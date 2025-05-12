import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddRoutingModule } from './add-routing.module';
import { AddComponent } from './add.component';
import { NbDatepickerModule,NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbSpinnerModule, NbTabsetModule, NbThemeModule, NbToastrModule, NbListModule, NbSelectModule, NbFormFieldModule } from '@nebular/theme';



@NgModule({
  declarations: [
    AddComponent
  ],
  imports: [
    FormsModule,
    NbFormFieldModule,
    ReactiveFormsModule, 
    CommonModule,
    AddRoutingModule,
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
export class AddModule { }
