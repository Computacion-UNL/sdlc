import { Component, Input, OnInit } from '@angular/core';
import { Activity } from '@app/_models/activity';
import { Member } from '@app/_models/member';
import { ActivityService } from '@app/_services/activity.service';
import { MemberService } from '@app/_services/member.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-edit-activity-responsible',
  templateUrl: './edit-activity-responsible.component.html',
  styleUrls: ['./edit-activity-responsible.component.scss']
})
export class EditActivityResponsibleComponent implements OnInit {
  @Input() project_id: string;
  @Input() activity_id: string;
  @Input() assigned: string[] = [];
  @Input() roles: { user: string, role: string }[] = [];
  @Input() disabled: boolean;
  loading: boolean = false;
  fetched: boolean = false;

  members: Member[] = [];

  config = {
    itemsPerPage: 5,
    currentPage: 1,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private memberService: MemberService,
    private activityService: ActivityService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.fetchMembers();
  }

  fetchMembers() {
    if (this.project_id) {
      this.memberService.getAll(this.project_id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.members = res?.filter(m => m.active === true).map(x => {
              let find = this.assigned.find(y => x.user._id === y);
              return {
                ...x,
                assigned: find !== undefined,
              }
            });

            this.loading = true;
            this.fetched = true;
          },
          error: err => {
            this.loading = false;
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          },
        });
    }
  }

  toggleAssign(id: string) {
    if (!this.disabled) {
      let foundIndex = this.members.findIndex(x => x._id === id);
      if(foundIndex > -1) {
        this.members[foundIndex].assigned = !this.members[foundIndex]?.assigned;
        const selected = this.members
          .map(x => x.assigned ? x.user._id : null)
          .filter((v: any) => v !== null);
        
        const roles = this.members
          .map(x => x.assigned ? { user: x.user._id, role: x.role.name } : null)
          .filter((v: any) => v !== null);

        let data: Activity = {
          change: {
            attribute_type: "Colaboradores",
            previous_value: "Colaboradores modificados",
            new_value: "Colaboradores modificados",
            activity: this.activity_id
          },
          _id: this.activity_id,
          responsable: selected,
          roles: roles,
        }

        this.roles = roles;  
        this.assigned = selected;
  
        this.activityService.edit(data, this.activity_id)
          .pipe(first())
          .subscribe({
            next: res => {
              //
            },
            error: err => {
              this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            },
          });
      }
    }
  }

  getRole(id: string) {
    return this.roles?.find(x => x.user === id)?.role;
  }

  closeModal() {
    this.activeModal.dismiss({
      responsable: this.assigned,
      roles: this.roles,
    })
  }
}
