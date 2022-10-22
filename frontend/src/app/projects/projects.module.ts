import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { MainComponent } from './views/main/main.component';
import { ProjectsListComponent } from './views/projects-list/projects-list.component';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateProjectComponent } from './components/create-project/create-project.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '@app/shared/shared.module';
import { ProjectsTeacherComponent } from './views/projects-teacher/projects-teacher.component';
import { ProgressProjectComponent } from './components/progress-project/progress-project.component';
import { AngularEditorModule } from '@kolkov/angular-editor';

@NgModule({
  declarations: [
    MainComponent,
    ProjectsListComponent,
    CreateProjectComponent,
    ProjectsTeacherComponent,
    ProgressProjectComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ProjectsRoutingModule,
    FontAwesomeModule,
    NgbModule,
    NgxPaginationModule,
    SharedModule,
    AngularEditorModule,
  ]
})
export class ProjectsModule {
  constructor(library: FaIconLibrary){
    library.addIconPacks(fas, far, fab);
  }
}
