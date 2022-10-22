import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '@app/_services/auth.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  year: number = new Date().getFullYear();

  form: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  returnUrl: string;

  loading_verify: boolean = false;
  
  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
  ) {
    if(this.authService.currentUserValue){
      this.router.navigate(['/manager']);
    }
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/manager';
    
    let verify = this.route.snapshot.queryParams['verify'];
    let email = this.route.snapshot.queryParams['email'];
    if(verify && email) {
      this.verify_account(verify, email);
    }
  }

  get f() { return this.form.controls }

  onSubmit() {
    this.submitted = true;

    if(this.form.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: data => {
          this.toastr.success('¡Bienvenido!', null, { positionClass: 'toast-bottom-center' });
          this.router.navigate([this.returnUrl]);
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
  }

  verify_account(token: string, email: string) {
    this.loading_verify = true;
    this.authService.verify(token, email)
      .pipe(first())
      .subscribe({
        next: (res: any) => {
          this.toastr.success(res.msg, null, { positionClass: 'toast-bottom-center' });
          this.loading_verify = false;
          //this.router.navigate(['/']);
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading_verify = false;
        }
      })
  }
}
