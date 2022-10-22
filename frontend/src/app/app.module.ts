import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';

import { ToastrModule } from 'ngx-toastr';

import { AuthModule } from './auth/auth.module';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { AuthComponent } from './_layouts/auth/auth.component';
import { DashboardComponent } from './_layouts/dashboard/dashboard.component';
import { MainMenuComponent } from './_components/main-menu/main-menu.component';
import { ProjectMenuComponent } from './_components/project-menu/project-menu.component';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { ProjectLayoutComponent } from './_layouts/project-layout/project-layout.component';
import { JoyrideModule } from 'ngx-joyride';
import { DataService } from './_services/data.service';
import { MainMenuMobileComponent } from './_components/main-menu-mobile/main-menu-mobile.component';
import { ProjectMenuMobileComponent } from './_components/project-menu-mobile/project-menu-mobile.component';
import { ProjectSummaryComponent } from './_components/project-summary/project-summary.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    DashboardComponent,
    MainMenuComponent,
    ProjectMenuComponent,
    ProjectLayoutComponent,
    MainMenuMobileComponent,
    ProjectMenuMobileComponent,
    ProjectSummaryComponent,
  ],
  imports: [
    BrowserModule,    
    HttpClientModule,
    AppRoutingModule,
    AuthModule,
    NgbModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    FontAwesomeModule,
    SharedModule,
    JoyrideModule.forRoot()
  ],
  providers: [
    DataService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary){
    library.addIconPacks(fas, far, fab);
  }
}
