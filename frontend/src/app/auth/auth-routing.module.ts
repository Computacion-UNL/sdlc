import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/_helpers/auth.guard';
import { InvitationComponent } from './views/invitation/invitation.component';
import { RecoverComponent } from './views/recover/recover.component';
import { ResendVerifyComponent } from './views/resend-verify/resend-verify.component';

import { SigninComponent } from './views/signin/signin.component';
import { SignupComponent } from './views/signup/signup.component';

const routes: Routes = [
    { path: '', component: SigninComponent, data: { title: 'Inicio de sesión' } },
    { path: 'signup', component: SignupComponent, data: { title: 'Registro de cuenta' } },
    { path: 'recover', component: RecoverComponent, data: { title: 'Recuperación de cuenta' } },
    { path: 'resend', component: ResendVerifyComponent, data: { title: 'Reenvío de verificación' } },
    { 
        path: 'invitation/:id', 
        canActivate: [AuthGuard],
        component: InvitationComponent, 
        data: { title: 'Invitación a proyecto' } 
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
