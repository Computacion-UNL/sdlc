import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

import { ModalComponent } from '@app/_components/modal/modal.component';
import { User } from '@app/_models/user';
import { UserService } from '@app/_services/user.service';
import { AccountService } from '@app/_services/account.service';
import { AuthenticationService } from '@app/_services/auth.service';
import { EditEmailComponent } from '@app/users/components/edit-email/edit-email.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  form: FormGroup;
  closeResult = '';

  config = {
    id: 'users',
    itemsPerPage: 10,
    currentPage: 1,
  };

  users: User[] = [];
  currentUser: User;
  searching: boolean = false;

  loading: boolean = false;

  constructor(
    public userService: UserService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private accountService: AccountService,
    private authService: AuthenticationService,
  ) {
    this.authService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit(): void {
    this.getAccounts();
    this.form = new FormGroup({
      search: new FormControl()
    });
  }


  userToggle(data: any) {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `${data.active ? 'Dar de baja' : 'Restaurar'} Cuenta`,
      message: `La cuenta del usuario será ${data.active ? 'dada de baja' : 'restaurada'}. ¿Deseas Continuar?`,
    }

    modalRef.closed.subscribe({
      next: res => {
        if (res) {
          //this.toastr.info("Actualizando...", null, { positionClass: 'toast-bottom-center' })
          this.userService.updateStatus(data._id, !data.active)
            .pipe(first())
            .subscribe({
              next: (res: any) => {
                this.toastr.success(res.msg, null, { positionClass: 'toast-bottom-center' });
                this.getAccounts();
              },
              error: err => {
                this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              }
            });
        }
      }
    });
  }

  adminToggle(data: any) {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `${data.admin ? 'Asignar Administrador como Usuario Normal' : 'Asignar Usuario como Administrador'}`,
      message: `${data.admin ?
        'El usuario con rol administrador pasará a tener un rol de usuario normal.¿Deseas Continuar? ' :
        'El usuario pasará a tener un rol de administrador.¿Deseas Continuar? '}`,
    }

    const dataUser: User = {
      id: data._id,
      admin: !data.admin
    };

    modalRef.closed.subscribe({
      next: res => {
        if (res) {
          this.accountService.updateAccount(dataUser).pipe(first())
            .subscribe((res: any) => {
              this.toastr.success(
                `${data.admin ?
                  'Se ha asignado al usuario como un usuario normal.' :
                  'Se ha asignado al usuario como administrador.'
                }`,
                null, { positionClass: 'toast-bottom-center' });
              this.getAccounts();
            });
        }
      }
    });
  }

  getAccounts() {
    this.loading = true;
    this.userService.getAll()
      .pipe(first())
      .subscribe({
        next: res => {
          this.users = res.filter(user => (user.email !== 'admin@unl.edu.ec' && user.email !== this.authService.currentUserValue.email));
          this.loading = false;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
  }

  searchUsers() {
    this.loading = true;
    this.userService.searchUsers(this.form.controls['search'].value)
      .subscribe({
        next: res => {
          this.users = res as User[];         
          this.users = this.users.filter((user) => user._id != this.currentUser.id);
          this.searching = true;
          this.loading = false;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
  }

  clearSearch() {
    this.getAccounts();
    this.form.controls['search'].reset();
    this.searching = false;
  }

  updateEmail(data: any) {
    const modalRef = this.modalService.open(EditEmailComponent, { centered: true, keyboard: false, backdrop: 'static' });
    modalRef.componentInstance.user = data;

    modalRef.dismissed.subscribe({
      next: res => {
        if (res) {
          this.getAccounts();
        }
      }
    });

  }

}
