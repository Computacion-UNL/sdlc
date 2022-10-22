import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './_helpers/auth.guard';
import { AuthComponent } from './_layouts/auth/auth.component';
import { DashboardComponent } from './_layouts/dashboard/dashboard.component';
import { ProjectLayoutComponent } from './_layouts/project-layout/project-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    loadChildren: () => import('@app/auth/auth.module').then(a => a.AuthModule),
  },
  {
    path: 'manager',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('@app/projects/projects.module').then(a => a.ProjectsModule),
  },
  {
    path: 'manager/users',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('@app/users/users.module').then(u => u.UsersModule),
  },
  {
    path: 'manager/profile',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('@app/profile/profile.module').then(p => p.ProfileModule),
  },
  {
    path: 'manager/project/:project',
    component: ProjectLayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('@app/project/project.module').then(p => p.ProjectModule),
  },
  {
    path: 'manager/settings',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('@app/config/config.module').then(c => c.ConfigModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
