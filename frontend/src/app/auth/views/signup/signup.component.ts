import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { first } from 'rxjs';

import { AuthenticationService } from '@app/_services/auth.service';
import { User } from "@app/_models/user";
import { confirmPassword } from "@app/auth/password-confirm.directive";
import { noWhiteSpaceValidator } from '@app/_helpers/form.validators';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  year: number = new Date().getFullYear();

  form: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/manager']);
    }
  }

  ngOnInit(): void {
    const urlRegex = /^[a-z0-9._%+-]+@unl.edu.ec/;
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(urlRegex)]],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
      pending: [false]
    }, { validators: [
      noWhiteSpaceValidator('name'),
      noWhiteSpaceValidator('lastname'),
      noWhiteSpaceValidator('password'),
      noWhiteSpaceValidator('confirm_password'),
      confirmPassword
    ] });
  }

  get f() { return this.form.controls }

  checkValue(event: any) {
    if (event.target.checked) {
      this.f['pending'].setValue(true);
    } else {
      this.f['pending'].setValue(false)
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    const data: User = {
      name: this.f['name'].value,
      lastname: this.f['lastname'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      pending: this.f['pending'].value,
      image: 'null',
    };

    this.authService.register(data)
      .pipe(first())
      .subscribe({
        next: data => {
          this.toastr.success('Te has registrado correctamente', null, { positionClass: 'toast-bottom-center' });
          this.router.navigate(['/']);
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
  }
}
