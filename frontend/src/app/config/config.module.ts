import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigRoutingModule } from './config-routing.module';
import { ConfigFormsComponent } from './views/config-forms/config-forms.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ConfigFormsComponent
  ],
  imports: [
    CommonModule,
    ConfigRoutingModule,
    ReactiveFormsModule,
  ]
})
export class ConfigModule { }
