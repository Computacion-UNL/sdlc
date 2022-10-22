import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsersListComponent } from '@app/users/views/users-list/users-list.component';

const routes: Routes = [
    { 
      path: '', 
      component: UsersListComponent, 
      data: { 
        title: 'Listado de Usuarios',
        description: 'Administra los usuarios registrados en el sistema.' 
      } 
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
