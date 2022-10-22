import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjectMembersComponent } from './views/project-members/project-members.component';
import { ProjectPlanningComponent } from './views/project-planning/project-planning.component';
import { ProjectReportsComponent } from './views/project-reports/project-reports.component';
import { ProjectScheduleComponent } from './views/project-schedule/project-schedule.component';
import { ProjectSettingsComponent } from './views/project-settings/project-settings.component';
import { ProjectRolesComponent } from './views/project-roles/project-roles.component';
import { ProjectActivitiesComponent } from "./views/project-activities/project-activities.component";
import { ProjectIndividualReportComponent } from './views/project-individual-report/project-individual-report.component';
import { ProjectProcessComponent } from './views/project-process/project-process.component';
import { ProjectXpComponent } from './views/project-xp/project-xp.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'planning',
    pathMatch: 'full'
  },
  {
    path: 'planning',
    component: ProjectXpComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ProjectPlanningComponent,
        data: {
          title: 'Planificación',
          description: 'Administra el flujo de trabajo y actividades el proyecto'
        },
      },
      {
        path: 'iteration/:id',
        component: ProjectProcessComponent,
        data: {
          title: 'Proceso',
          description: 'Lleva a cabo las actividades de la iteración'
        },
      },
      {
        path: 'individual-report/:id',
        component: ProjectIndividualReportComponent,
        data: {
          title: 'Reporte de Iteración',
          description: 'Visualiza el resumen de la iteración en la que estás trabajando'
        }
      }
    ]
  },
  {
    path: 'reports',
    component: ProjectReportsComponent,
    data: {
      title: 'Reportes',
      description: 'Visualiza la información recolectada del proyecto'
    }
  },
  {
    path: 'schedule',
    component: ProjectScheduleComponent,
    data: {
      title: 'Cronograma',
      description: 'Administra el flujo de trabajo y actividades el proyecto'
    }
  },
  {
    path: 'settings',
    component: ProjectSettingsComponent,
    data: {
      title: 'Ajustes',
      description: 'Modifica la información de tu proyecto'
    }
  },
  {
    path: 'members',
    component: ProjectMembersComponent,
    data: {
      title: 'Colaboradores',
      description: 'Administra los colaboradores que participarán en el proyecto'
    }
  },
  {
    path: 'roles',
    component: ProjectRolesComponent,
    data: {
      title: 'Roles',
      description: 'Administra los roles personalizados de tu proyecto'
    }
  },
  {
    path: 'activity/:id',
    component: ProjectActivitiesComponent,
    data: {
      title: 'Actividad',
      description: 'Visualiza y administra la información de las activades'
    }
  },
  {
    path: 'subactivity/:id',
    component: ProjectActivitiesComponent,
    data: {
      title: 'Subactividad',
      description: 'Visualiza y administra la información de la subactividad'
    }
  },
  {
    path: 'incidence/:id',
    component: ProjectActivitiesComponent,
    data: {
      title: 'Incidencia',
      description: 'Visualiza y administra la información de la incidencia'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule { }
