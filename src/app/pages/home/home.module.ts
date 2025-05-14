import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbSpinnerModule, NbTabsetModule, NbThemeModule, NbToastrModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckboxRenderComponent } from './checkbox-render/checkbox-render.component';



@NgModule({
  declarations: [
    HomeComponent,
    CheckboxRenderComponent,
    
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
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
    NbSpinnerModule,
    ReactiveFormsModule
  ],
  
})
export class HomeModule { }
