import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigFormsComponent } from './views/config-forms/config-forms.component';

const routes: Routes = [
  { 
    path: '',
    component: ConfigFormsComponent,
    data: {
      title: 'Configuración',
      description: 'Configuraciones principales de la aplicación.'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule { }
