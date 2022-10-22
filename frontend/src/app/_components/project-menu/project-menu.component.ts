import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Utilities } from '@app/_helpers/Utilities';
import { Project } from '@app/_models/project';
import { MemberService } from '@app/_services/member.service';
import { ProjectService } from '@app/_services/project.service';
import { AuthenticationService } from '@app/_services/auth.service';

import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';
import { Member } from '@app/_models/member';
import { environment } from '@environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectSummaryComponent } from '../project-summary/project-summary.component';

@Component({
  selector: 'app-project-menu',
  templateUrl: './project-menu.component.html',
  styleUrls: ['./project-menu.component.scss']
})
export class ProjectMenuComponent implements OnInit {
  @Output() close = new EventEmitter();
  
  project_id: string;
  project: Project;
  membersfiltered: Member[];
  user_id: string;
  img_url: string;
  is_manager: boolean;

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    public projectService: ProjectService,
    private memberService: MemberService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.project_id = this.route.snapshot.paramMap.get('project');
    this.user_id = this.authService.currentUserValue.id;
    this.fetchProject();
    this.isAuthorized();
  }

  fetchProject() {
    if (this.project_id) {
      this.projectService.get(this.project_id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.project = res;
            this.projectService.name = this.project.name;
            if (this.project.image) {
              this.img_url = `${environment.apiURL.public}${this.project.image}`;
            }
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          },
        })
    }
  }

  //Determinar si el usuario tiene permiso para acceder a los ajustes del proyecto
  isAuthorized() {
    this.memberService.getAll(this.project_id)
      .pipe(first())
      .subscribe({
        next: res => {
          res.forEach(element => {
            element?.role?.permissions?.forEach(el => {
              if (el === 1 || el === 9) {
                if (element.user._id === this.user_id) {
                  this.is_manager = true;
                }
              }
            });
          });
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        },
      });
  }

  getAcronym(input: string) {
    return Utilities.generateAcronym(input);
  }

  closeMenu() {
    this.close.emit();
  }

  openInfoProject() {
    const modalRef = this.modalService.open(ProjectSummaryComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.project = this.project;
  }
}
