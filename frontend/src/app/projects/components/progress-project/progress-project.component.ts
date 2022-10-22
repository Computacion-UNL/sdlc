import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utilities } from '@app/_helpers/Utilities';
import { Activity } from '@app/_models/activity';
import { ActivityService } from '@app/_services/activity.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';


@Component({
  selector: 'app-progress-project',
  templateUrl: './progress-project.component.html',
  styleUrls: ['./progress-project.component.scss']
})
export class ProgressProjectComponent implements OnInit {

  @Input() id_project: string;
  performed_activities:Activity[];
  discard_activities:Activity[];
  delayed_activities: Activity[];


  constructor(
    public activeModal: NgbActiveModal,
    private activityService: ActivityService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.fetchActivities();
    
  }

  fetchActivities() {
    this.activityService.getAllByProject(this.id_project)
    .pipe(first())
      .subscribe({
        next: res => {
          this.performed_activities = res.filter((a) => a.discard === false && this.delayActivity(a.finish_date,a.finish_real_date) == 0);
          this.discard_activities = res.filter((a) => a.discard === true);
          this.delayed_activities = res.filter((a) =>  a.discard === false && this.delayActivity(a.finish_date,a.finish_real_date) > 0);
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        }
      });
  }

  getAcronym(input: string) {
    return Utilities.generateAcronym(input);
  }

  delayActivity(finish_date_activity, finish_real_date_activity) {
    return Utilities.delayActivity(finish_date_activity, finish_real_date_activity);
  }

  goProject() {
    this.router.navigate(['/manager/project/', this.id_project, 'planning']);
    this.activeModal.dismiss();
  }


}
