import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { SigninComponent } from './views/signin/signin.component';
import { SignupComponent } from './views/signup/signup.component';
import { RecoverComponent } from './views/recover/recover.component';
import { InvitationComponent } from './views/invitation/invitation.component';
import { ResendVerifyComponent } from './views/resend-verify/resend-verify.component';



@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    RecoverComponent,
    InvitationComponent,
    ResendVerifyComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule,
  ]
})
export class AuthModule { }
