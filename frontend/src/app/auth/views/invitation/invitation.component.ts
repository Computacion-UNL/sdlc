import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from '@app/_models/member';
import { MemberService } from '@app/_services/member.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss']
})
export class InvitationComponent implements OnInit {
  year: number = new Date().getFullYear();

  member: Member;
  loading: boolean = false;
  resp_loading: boolean = false;
  rejected: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private memberService: MemberService,
  ) { }

  ngOnInit(): void {
    let id = this.route.snapshot.paramMap.get('id');
    this.fetchInvitation(id);
  }

  fetchInvitation(id: string) {
    this.loading = true;
    this.memberService.invitation(id)
      .pipe(first())
      .subscribe({
        next: (res: any) => {
          this.member = res;
          this.loading = false;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
  }

  accept() {
    this.resp_loading = true;
    this.memberService
      .edit({ id: this.member._id, active: true })
      .pipe(first())
      .subscribe({
        next: res => {
          this.member.active = true;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.resp_loading = false;
        }
      });
  }

  reject() {
    this.resp_loading = true;
    this.member.removed = true;
    this.memberService
      .remove(this.member._id)
      .pipe(first())
      .subscribe({
        next: res => {
          this.member.active = true;
          this.rejected = true;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.resp_loading = false;
        }
      });
  }

}
