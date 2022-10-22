import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project-routing.module';
import { ProjectSettingsComponent } from './views/project-settings/project-settings.component';
import { ProjectPlanningComponent } from './views/project-planning/project-planning.component';
import { ProjectScheduleComponent } from './views/project-schedule/project-schedule.component';
import { ProjectReportsComponent } from './views/project-reports/project-reports.component';
import { ProjectMembersComponent } from './views/project-members/project-members.component';
import { ProjectRolesComponent } from './views/project-roles/project-roles.component';
import { ProjectActivitiesComponent } from './views/project-activities/project-activities.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InviteMemberComponent } from './components/invite-member/invite-member.component';
import { ChangeRoleComponent } from './components/change-role/change-role.component';
import { CreateIterationComponent } from './components/create-iteration/create-iteration.component';
import { CreateActivityComponent } from './components/create-activity/create-activity.component';
import { DndModule } from 'ngx-drag-drop';
import { CreateRoleComponent } from './components/create-role/create-role.component';
import { CreateAttachmentComponent } from './components/create-attachment/create-attachment.component';
import { InfoActivityComponent } from './components/info-activity/info-activity.component';
import { ChangeTaskComponent } from './components/change-task/change-task.component';
import { EditActivityNameComponent } from './components/edit-activity-name/edit-activity-name.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { HttpClientModule } from '@angular/common/http';
import { EditActivityDescriptionComponent } from './components/edit-activity-description/edit-activity-description.component';
import { EditActivityResponsibleComponent } from './components/edit-activity-responsible/edit-activity-responsible.component';
import { EditActivityCommentComponent } from './components/edit-activity-comment/edit-activity-comment.component';
import { ActivityCommentsComponent } from './components/activity-comments/activity-comments.component';
import { InitIterationComponent } from './components/init-iteration/init-iteration.component';
import { ModalIterationsComponent } from './components/modal-iterations/modal-iterations.component';
import { JoyrideModule } from 'ngx-joyride';
import { AddToIterationComponent } from './components/add-to-iteration/add-to-iteration.component';
import { AddNewActivityComponent } from './components/add-new-activity/add-new-activity.component';
import { ProjectProcessComponent } from './views/project-process/project-process.component';
import { ProjectXpComponent } from './views/project-xp/project-xp.component';
import { ProjectIndividualReportComponent } from './views/project-individual-report/project-individual-report.component';
import { InfoIterationComponent } from './components/info-iteration/info-iteration.component';

@NgModule({
  declarations: [
    ProjectSettingsComponent,
    ProjectPlanningComponent,
    ProjectScheduleComponent,
    ProjectReportsComponent,
    InviteMemberComponent,
    ProjectMembersComponent,
    ChangeRoleComponent,
    ProjectRolesComponent,
    ProjectActivitiesComponent,
    CreateIterationComponent,
    CreateActivityComponent,
    CreateRoleComponent,
    CreateAttachmentComponent,
    InfoActivityComponent,
    ChangeTaskComponent,
    EditActivityNameComponent,
    EditActivityDescriptionComponent,
    EditActivityResponsibleComponent,
    EditActivityCommentComponent,
    ActivityCommentsComponent,
    InitIterationComponent,
    ModalIterationsComponent,
    AddToIterationComponent,
    AddNewActivityComponent,
    ProjectProcessComponent,
    ProjectXpComponent,
    ProjectIndividualReportComponent,
    InfoIterationComponent,
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    FontAwesomeModule,
    NgxPaginationModule,
    SharedModule,
    NgxChartsModule,
    DndModule,
    HttpClientModule,
    AngularEditorModule,
    JoyrideModule.forChild()
  ],
})
export class ProjectModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far, fab);
  }
}
