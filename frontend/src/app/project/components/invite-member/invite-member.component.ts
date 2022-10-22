import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role } from '@app/_models/role';
import { User } from '@app/_models/user';
import { UserService } from '@app/_services/user.service';
import { RoleService } from '@app/_services/role.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { catchError, debounceTime, distinctUntilChanged, first, Observable, of, OperatorFunction, switchMap, tap } from 'rxjs';
import { Member } from '@app/_models/member';
import { MemberService } from '@app/_services/member.service';

@Component({
  selector: 'app-invite-member',
  templateUrl: './invite-member.component.html',
  styleUrls: ['./invite-member.component.scss']
})
export class InviteMemberComponent implements OnInit {
  @Input() project: string;
  @Output() refresh = new EventEmitter();
  
  loading: boolean = false;
  loading_roles: boolean = false;
  submitted: boolean = false;
  searching: boolean = false;
  searchFailed: boolean = false;
  roles: Role[] = [];

  form: FormGroup;
  modalRef: NgbModalRef;


  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private memberService: MemberService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: [null, Validators.required],
      role: [null, Validators.required]
    });

    this.fetchRoles();
  }

  fetchRoles() {
    if(this.project) {
      this.loading_roles = true;
      this.roleService.getAll(this.project)
        .pipe(first())
        .subscribe({
          next: res => {
            this.loading_roles = false;
            this.roles = res;
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading_roles = false;
          }
        })
    }
  }

  get f() { return this.form.controls }
  
  open(content: any) {
    this.modalRef = this.modalService.open(content, { centered: true });
    this.modalRef.dismissed.subscribe({
      next: value => {
        this.form.reset();
        this.submitted = false;
        this.loading = false;
      }
    });

    this.modalRef.closed.subscribe({
      next: value => {
        if(value)
          this.refresh.emit();
          
          this.form.reset();
          this.submitted = false;
          this.loading = false;
      }
    });
  }

  onSubmit() {
    if(this.project){
      this.submitted = true;
      
      if(this.form.invalid){
        return;
      }

      this.loading = true;

      const data: any = {
        user: this.f['email'].value._id,
        email: this.f['email'].value.email,
        role: this.f['role'].value,
        project: this.project,
      };
      
      this.memberService.add(data)
        .pipe(first())
        .subscribe({
          next: res => {
            this.toastr.success("La invitación ha sido enviada correctamente.", null, { positionClass: 'toast-bottom-center' });
            this.modalRef.close(true);
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading = false;
          },
        })
    }else {
      this.toastr.error("¡No hay un proyecto asociado!", null, { positionClass: 'toast-bottom-center' });
    }
  }

  formatter = (result: User) => {
    return result.email;
  };

  search: OperatorFunction<string, any> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this.userService.searchUsers(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        )  
      ),
      tap(() => this.searching = false)
    );
}
