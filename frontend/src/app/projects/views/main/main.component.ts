import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

import { ActivityService } from "@app/_services/activity.service";
import { ProjectService } from '@app/_services/project.service';
import { Activity } from '@app/_models/activity';
import { Project } from '@app/_models/project';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  numbers = { pending: 0, developing: 0, finished: 0 };
  projects = [];
  activities = [];
  options: Project = { status: "En ejecución" };

  loading_projects: boolean = false;
  loading_activities: boolean = false;

  constructor(
    private toastr: ToastrService,
    private activityService: ActivityService,
    private projectService: ProjectService,
  ) { }

  ngOnInit(): void {
    this.fetchProjects(this.options);
    this.fetchActivities();
  }

  //Obtener Actividades del Usuario
  fetchActivities() {
    this.loading_activities = true;
    this.activityService.getAllByUser()
      .pipe(first())
      .subscribe({
        next: res => {
          this.loading_activities = false;
          this.activities = res;
          this.numbers =  this.getNumberOfActivities(res as Activity[]);
        },
        error: err => {
          this.loading_activities = false;
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        }
      });
  }


  private getNumberOfActivities(activities: Activity[]) {
    let numbers = { pending: 0, developing: 0, finished: 0 }
    activities.forEach(activity => {
      switch (activity.status) {
        case "Por Hacer":
          numbers.pending++;
          break;
        case "En Curso":
          numbers.developing++;
          break;
        case "Finalizada":
          numbers.finished++;
          break;
      }
    });
    return numbers;
  }

  //Obtener Proyectos del Usuario (Propietario)
  fetchProjects(options) {
    this.loading_projects = true;
    this.projectService.getAllProjectsByUser(options).pipe(first()).subscribe({
      next: (res:any) => {
        this.projects = res;
        this.loading_projects = false;
      },
      error: err => {
        this.loading_projects = false;
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }

  setBackground(status: string): string {
    var bg = '';

    switch (status) {
      case "Por Hacer":
        bg = 'bg_to-do';
        break;

      case "En Curso":
        bg = 'bg_in-progress';
        break;

      case "Finalizada":
        bg = 'bg_done';
        break;
    
      default:
        bg = 'bg_to-do'
        break;
    }

    return bg;
  }
}
