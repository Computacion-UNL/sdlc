import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '@app/_models/user';
import { AccountService } from '@app/_services/account.service';
import { AuthenticationService } from '@app/_services/auth.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';


@Component({
  selector: 'app-edit-email',
  templateUrl: './edit-email.component.html',
  styleUrls: ['./edit-email.component.scss']
})
export class EditEmailComponent implements OnInit {
  @Input() user: User;
  @Output() close = new EventEmitter();

  form_user: FormGroup;
  submitted_user: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private authService: AuthenticationService,
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    const urlRegex = /^[a-z0-9._%+-]+@unl.edu.ec/;
    this.form_user = this.formBuilder.group({
      email: [this.user.email, [Validators.required, Validators.email, Validators.pattern(urlRegex)]],
    });
  }

  get fu() { return this.form_user.controls }

  submitUser() {
    this.submitted_user = true;
    if (this.form_user.invalid) {
      return;
    }

    const data: User = {
      id: this.user._id,
      email: this.fu['email'].value
    };

    this.accountService.updateAccount(data).pipe(first()).subscribe({
      next: (res:any) => {
        this.toastr.success(res.msg, null, { positionClass: 'toast-bottom-center' });
        this.activeModal.dismiss(res);
        this.submitted_user = false;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.submitted_user = false;
      },
    });
  }

}
