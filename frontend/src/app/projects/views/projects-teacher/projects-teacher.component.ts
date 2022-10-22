import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ProgressProjectComponent } from '@app/projects/components/progress-project/progress-project.component';
import { Utilities } from '@app/_helpers/Utilities';
import { Activity } from '@app/_models/activity';
import { Project } from '@app/_models/project';
import { ActivityService } from '@app/_services/activity.service';
import { AuthenticationService } from '@app/_services/auth.service';
import { MemberService } from '@app/_services/member.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';


@Component({
  selector: 'app-projects-teacher',
  templateUrl: './projects-teacher.component.html',
  styleUrls: ['./projects-teacher.component.scss']
})
export class ProjectsTeacherComponent implements OnInit {
  loading: boolean = false;
  fetched: boolean = false;
  form: FormGroup;
  searching: boolean = false;
  user_id: string;
  is_manager: boolean;
  options: Project = { status: "En ejecución" };

  config = {
    id: 'projects',
    itemsPerPage: 12,
    currentPage: 1,
  };

  projects: Project[] = [];
  activities: Activity[] = [];

  constructor(
    private activityService: ActivityService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private memberService: MemberService,
    private authService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.user_id = this.authService.currentUserValue.id;
    this.fetchProjects();
    this.form = new FormGroup({
      search: new FormControl()
    });
  }

  setOptions(status: string) {
    this.options.status = status;
    return this.options;
  }

  fetchProjects() {
    this.loading = true;
    this.memberService.getProjectsByUser(this.user_id)
      .pipe(first())
      .subscribe({
        next: res => {
          this.projects = res as Project[];
          this.projects.forEach(project => {
            this.fetchActivities(project);
          });
          this.loading = false;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
  }


  fetchActivities(project: Project) {
    this.activityService.getAllByProject(project._id)
      .pipe(first())
      .subscribe({
        next: res => {
          this.activities = res as Activity[];
          project.activities_numbers = [
            { name: "Total", value: this.activities.length },
            { name: "Finalizadas", value: this.activities.filter((a) => a.status == "Finalizada").length },
          ];
          project.activities_progress = (this.activities.filter((a) => a.status == "Finalizada").length * 100) / this.activities.length;
          project.activities_delayed = this.activities.filter((a) => a.discard === false && this.delayActivity(a.finish_date, a.finish_real_date) > 0).length;
          this.loading = false;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
  }

  searchProjects() {
    this.memberService.searchProjectsByUser(this.form.controls['search'].value, this.user_id)
      .subscribe((res: any) => {
        this.projects = res as Project[];
        this.projects.forEach(project => {
          this.fetchActivities(project);
        });
        this.searching = true;
      });
  }

  clearSearch() {
    this.fetchProjects();
    this.form.controls['search'].reset();
    this.searching = false;
  }

  showProgress(id_project: string) {
    const modalRef = this.modalService.open(ProgressProjectComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.id_project = id_project;
  }

  delayActivity(finish_date_activity, finish_real_date_activity) {
    return Utilities.delayActivity(finish_date_activity, finish_real_date_activity);
  }

  removeHTMLTags(input: string) {
    return input?.replace(/(<([^>]+)>)/ig, ' ') || 'Nada';
  }

}
