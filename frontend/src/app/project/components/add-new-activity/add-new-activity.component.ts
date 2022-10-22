import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateLessThan, noWhiteSpaceValidator } from '@app/_helpers/form.validators';
import { Activity } from '@app/_models/activity';
import { ActivityService } from '@app/_services/activity.service';
import { AuthenticationService } from '@app/_services/auth.service';
import { MemberService } from '@app/_services/member.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-add-new-activity',
  templateUrl: './add-new-activity.component.html',
  styleUrls: ['./add-new-activity.component.scss']
})
export class AddNewActivityComponent implements OnInit {
  @Input() iteration: string;
  @Input() phase: string;
  @Input() project_id: string;

  form: FormGroup;

  loading: boolean = false;
  submitted: boolean = false;
  user_id:string;
  is_manager: boolean = false;

  now: Date = new Date();

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private activityService: ActivityService, 
    private authService: AuthenticationService,  
    private memberService: MemberService, 
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.user_id = this.authService.currentUserValue.id;
    this.getCollaborator();
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      start_date: [formatDate(this.now,'yyyy-MM-dd', 'en','+0000'), Validators.required],
      finish_date: [formatDate(this.now,'yyyy-MM-dd', 'en','+0000'), Validators.required],
    }, { validator: [DateLessThan('start_date', 'finish_date'), noWhiteSpaceValidator('name')] });
  }
  
  get f() { return this.form.controls }

  getCollaborator() {
    this.memberService.getMember(this.project_id, this.user_id)
    .pipe(first())
      .subscribe({
        next: res => {
          if (res.role.name === "Gestor") {
            this.is_manager = true;
          }
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        },
      });
  }


  onSubmit() {
    this.submitted = true;

    if (this.form.invalid)
      return;

    this.loading = true;
    const data: Activity = {
      project: this.project_id,
      name: this.f['name'].value,
      start_date: this.f['start_date'].value,
      finish_date: this.f['finish_date'].value,
      iteration: this.iteration,
      phase: this.phase,
      priority: 'Media',
      incidence: false,
      created_by_manager: this.is_manager
    };

    this.activityService.add(data)
      .pipe(first())
      .subscribe({
        next: res => {
          this.toastr.success("La iteración ha sido modificada correctamente.", null, { positionClass: 'toast-bottom-center' });
          this.activeModal.close(res);
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        },
      });
  }
}
