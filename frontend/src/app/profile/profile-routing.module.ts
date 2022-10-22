import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProfileComponent } from '@app/profile/views/profile/profile.component';
import { EditProfileComponent } from './views/edit-profile/edit-profile.component';

const routes: Routes = [
  { 
    path: '', 
    component: ProfileComponent, 
    data: { 
      title: 'Mi perfil',
      description: 'Administra tus datos personales y credenciales', 
    } 
  },
  {
    path: 'edit',
    component: EditProfileComponent,
    data: { 
      title: 'Editar perfil',
      description: 'Administra tus datos personales y credenciales', 
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
