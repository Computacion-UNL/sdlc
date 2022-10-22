import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './views/main/main.component';
import { ProjectsListComponent } from './views/projects-list/projects-list.component';
import { ProjectsTeacherComponent } from './views/projects-teacher/projects-teacher.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { 
    path: 'home', 
    component: MainComponent, 
    data: { 
      title: 'Principal', 
      description: 'Resumen de todos los proyectos, acciones y tareas en las que estás ligado.' 
    } 
  },
  { 
    path: 'projects', 
    component: ProjectsListComponent, 
    data: { 
      title: 'Proyectos',
      description: 'Administra todos tus proyectos en un solo lugar.'
    } 
  },
  {
    path: 'projects-teacher',
    component: ProjectsTeacherComponent,
    data: {
      title: 'Proyectos',
      description: 'Visualiza los proyectos y avances de los proyectos en los que te encuentras vinculado.'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
