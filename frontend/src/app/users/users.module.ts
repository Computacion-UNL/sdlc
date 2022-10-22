import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

import { DropdownComponent } from '@app/_components/dropdown/dropdown.component';
import { UsersRoutingModule } from './users-routing.module';
import { UsersListComponent } from './views/users-list/users-list.component';
import { SharedModule } from '@app/shared/shared.module';
import { EditEmailComponent } from './components/edit-email/edit-email.component';

@NgModule({
  declarations: [
    UsersListComponent,
    DropdownComponent,
    EditEmailComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    UsersRoutingModule,
    FontAwesomeModule,
    NgxPaginationModule,
    SharedModule,
  ]
})
export class UsersModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far, fab);
  }
}
