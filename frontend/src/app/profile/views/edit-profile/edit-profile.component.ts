import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { AuthenticationService } from '@app/_services/auth.service';
import { ModalComponent } from '@app/_components/modal/modal.component';
import { AccountService } from '@app/_services/account.service';
import { UserService } from '@app/_services/user.service';
import { User } from '@app/_models/user';
import { first } from 'rxjs';
import { noWhiteSpaceValidator } from '@app/_helpers/form.validators';
import { confirmNewPassword } from '@app/auth/password-confirm.directive';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  user: User;
  url_user: string;
  form_user: FormGroup;
  form_password: FormGroup;
  submitted_user: boolean = false;
  submitted_password: boolean = false;
  
  loading_upload: boolean = false;
  loading_delete_img: boolean = false;
  loading_user: boolean = false;
  loading_password: boolean = false;
  loading_delete: boolean = false;

  prod: boolean = environment.production;

  constructor(
    private authService: AuthenticationService,
    private accountService: AccountService,
    private userService: UserService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.user = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.url_user = `${environment.apiURL.public}${this.user.image}`;

    const urlRegex = /^[a-z0-9._%+-]+@unl.edu.ec/;
    this.form_user = this.formBuilder.group({
      name: [this.user.name, Validators.required],
      lastname: [this.user.lastname, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email, Validators.pattern(urlRegex)]],
    }, { validator: [noWhiteSpaceValidator('name'), noWhiteSpaceValidator('lastname')], });

    this.form_password = this.formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirm_password: ['', Validators.required],
    }, { validator: [noWhiteSpaceValidator('newPassword'),noWhiteSpaceValidator('confirm_password'),confirmNewPassword] });

    if (!this.user.admin) {
      this.fu['email'].disable();
    }
    
  }

  get fu() { return this.form_user.controls }

  get fp() { return this.form_password.controls }


  //Subir Imagen de Perfil
  uploadImage(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.loading_upload = true;
      this.accountService.uploadImage(this.user.id, file).subscribe((data) => {
        this.authService.refreshData()
          .pipe()
          .subscribe({
            next: user => {
              this.toastr.success('Se actualizó la imagen de perfil correctamente', null, { positionClass: 'toast-bottom-center' });
              this.user = user;
              this.url_user = `${environment.apiURL.public}${this.user.image}`;
              this.loading_upload = false;
            },
            error: err => {
              this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              this.loading_upload = false;
            }
          });
      });
    }
  }

  //Quitar Imagen de Perfil
  deleteImage() {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Dar de baja a imagen`,
      message: `¿Está seguro que desea dar de baja su imagen de perfil?`,
    };

    modalRef.closed.subscribe({
      next: val => {
        if (val) {
          this.loading_delete_img = true;
          this.accountService.deleteImage(this.user.id)
            .subscribe({
              next: (res: any) => {
                this.toastr.success("La imagen fue guardada correctamente.", null, { positionClass: 'toast-bottom-center' });
                this.authService.refreshData()
                  .pipe(first())
                  .subscribe({
                    next: user => {
                      this.user = user;
                      this.url_user = `${environment.apiURL.public}${this.user.image}`;
                      this.toastr.info("Información actualizada...", null, { positionClass: 'toast-bottom-center' });
                    },
                    error: err => {
                      this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
                    }
                  });

                this.loading_delete_img = false;
              },
              error: err => {
                this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
                this.loading_delete_img = false;
              }
            });
        }
      }
    });
  }

  //Actualizar Usuario
  submitUser() {
    this.submitted_user = true;
    if (this.form_user.invalid) {
      return;
    }

    this.loading_user = true;
    const data: User = {
      id: this.user.id,
      name: this.fu['name'].value,
      lastname: this.fu['lastname'].value,
      email: this.fu['email'].value
    };

    this.accountService.updateAccount(data).pipe().subscribe((res: any) => {
      this.authService.refreshData()
        .pipe(first())
        .subscribe({
          next: (user) => {
            this.toastr.success(res.msg, null, { positionClass: 'toast-bottom-center' });
            this.user = user;

            this.loading_user = false;
            this.submitted_user = false;
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading_user = false;
            this.submitted_user = false;
          },
        });
    });
  }

  //Actializar Contrasena
  submitPassword() {
    this.submitted_password = true;
    if (this.form_password.invalid) {
      return;
    }

    this.loading_password = true;

    const data = {
      id: this.user.id,
      oldPassword: this.fp['oldPassword'].value,
      newPassword: this.fp['newPassword'].value
    };

    this.accountService.changePassword(data).pipe().subscribe({
      next: (res: any) => {
        this.authService.refreshData().pipe().subscribe({
          next: user => {
            this.toastr.success(res.msg, null, { positionClass: 'toast-bottom-center' });
            this.user = user;
            this.submitted_password = false;
            this.loading_password = false;
            this.form_password.reset();
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.submitted_password = false;
            this.loading_password = false;
          },
        });
      }, error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.submitted_password = false;
        this.loading_password = false
      }
    });
  }

  //Dar de baja Cuenta
  deleteUser() {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: "Dar de baja a Cuenta",
      message: "¿Está seguro que desea dar de baja su cuenta?"
    };


    modalRef.closed.subscribe(result => {
      if (result) {
        this.loading_delete = true;
        this.userService.updateStatus(this.user.id, false)
          .pipe(first())
          .subscribe({
            next: (res: any) => {
              this.authService.logout();
              this.router.navigate(['/']);

              this.loading_delete = false;
            },
            error: err => {
              this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              this.loading_delete = false;
            },
          });
      }
    });
  }

}
