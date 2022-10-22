import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Member } from '@app/_models/member';
import { Role } from '@app/_models/role';
import { MemberService } from '@app/_services/member.service';
import { RoleService } from '@app/_services/role.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-change-role',
  templateUrl: './change-role.component.html',
  styleUrls: ['./change-role.component.scss']
})
export class ChangeRoleComponent implements OnInit {
  @Input() owner: string;
  @Input() member: Member;
  @Input() project: string;
  @Input() selected: string;

  control: FormControl = new FormControl();
  roles: Role[] = [];

  loading: boolean = false;

  constructor(
    private roleService: RoleService,
    private memberService: MemberService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.control.setValue(this.selected);
    this.fetchRoles();
  }

  fetchRoles() {
    this.roleService.getAll(this.project)
      .pipe(first())
      .subscribe({
        next: res => {
          this.roles = res;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        },
      });
  }

  updateRole() {

    if (this.project) {
      this.loading = true;
      const data: Member = {
        id: this.owner,
        role: this.control.value,
      }

      this.memberService.getAll(this.project)
        .pipe(first())
        .subscribe({
          next: res => {
            let isLastManager = res.filter((m) => m.role.name === "Gestor" && m._id === data.id).length;
            let manager_members = res.filter((m) => m.role.name === "Gestor").length;

            if (!(isLastManager == 1) || manager_members > 1) {
              this.memberService.edit(data)
                .pipe(first())
                .subscribe({
                  next: res => {
                    this.toastr.success("Rol asignado correctamente", null, { positionClass: 'toast-bottom-center' });
                    this.loading = false;
                  },
                  error: err => {
                    this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
                    this.loading = false;
                  }
                });
            } else {
              this.toastr.error("Debe existir al menos un colaborador con rol de gestor", null, { positionClass: 'toast-bottom-center' });
              this.control.setValue(this.selected);
              this.loading = false;
            }

          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading = false;
          }
        });
    }
  }
}
