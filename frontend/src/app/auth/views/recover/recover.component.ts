import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/_services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss']
})
export class RecoverComponent implements OnInit {
  year: number = new Date().getFullYear();
  
  form: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;

  sent: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
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
    });
  }

  get f() { return this.form.controls }

  onSubmit() {
    this.submitted = true;

    if(this.form.invalid) {
      return;
    }

    this.loading = true;

    this.authService.recovery(this.f['email'].value)
    .pipe(first())
    .subscribe({
      next: (res: any) => {
        this.toastr.success(res.msg, null, { positionClass: 'toast-bottom-center' });
        this.loading = false;
        this.submitted = false;
        this.sent = true;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.loading = false;
      }
    })
  }

}
