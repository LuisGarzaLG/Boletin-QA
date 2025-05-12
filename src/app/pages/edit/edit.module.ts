import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NbAccordionModule,NbDatepickerModule,NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbSpinnerModule, NbTabsetModule, NbThemeModule, NbToastrModule, NbListModule, NbSelectModule, NbFormFieldModule, NbToggleModule } from '@nebular/theme';
import { EditComponent } from './edit.component';
import { EditRoutingModule } from './edit-routing.module';



@NgModule({
  declarations: [
    EditComponent
  ],
  imports: [
    FormsModule,
    NbAccordionModule,
    NbFormFieldModule,
    ReactiveFormsModule, 
    CommonModule,
    EditRoutingModule,
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
    NbToggleModule,
    NbToastrModule.forRoot()
  ]
})
export class EditModule { }
