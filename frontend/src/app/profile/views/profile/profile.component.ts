import { Component, OnInit } from '@angular/core';

import { environment } from "@environments/environment";
import { AuthenticationService } from '@app/_services/auth.service';
import { ProjectService } from '@app/_services/project.service';
import { User } from '@app/_models/user';
import { first } from 'rxjs';
import { Utilities } from '@app/_helpers/Utilities';
import { Project } from '@app/_models/project';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User;
  projects: Project[] = [];
  url_user:string;
  url_project:string;
  options: Project = { status: "En ejecución" };

  loading_projects: boolean = false;
  prod: boolean = environment.production;

  constructor(
    private authService: AuthenticationService,
    private projectService: ProjectService,
    private toastr: ToastrService,
  ) {
    this.user = this.authService.currentUserValue;
   }

  ngOnInit(): void {
    this.fetchProjects(this.options);
    this.url_user = `${environment.apiURL.public}${this.user.image}`;
    this.url_project = `${environment.apiURL.v1}/project/image`;
  }

  fetchProjects(options) {
    this.loading_projects = true;
    this.projectService.getAllProjectsByUser(options)
      .pipe(first())
      .subscribe({
        next: res => {
          this.projects = res as Project[];
          this.loading_projects = false;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading_projects = false;
        }
      });
  }

  getAcronym(input: string) {
    return Utilities.generateAcronym(input);
  }

}
