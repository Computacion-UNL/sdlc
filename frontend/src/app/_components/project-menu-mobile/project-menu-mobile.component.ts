import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from '@app/_models/member';
import { Project } from '@app/_models/project';
import { AuthenticationService } from '@app/_services/auth.service';
import { MemberService } from '@app/_services/member.service';
import { ProjectService } from '@app/_services/project.service';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-project-menu-mobile',
  templateUrl: './project-menu-mobile.component.html',
  styleUrls: ['./project-menu-mobile.component.scss']
})
export class ProjectMenuMobileComponent implements OnInit {
  @Output() open = new EventEmitter();
  
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
    private authService: AuthenticationService
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
            element?.role?.permissions.forEach(el => {
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

  openMenu() {
    this.open.emit();
  }

}
