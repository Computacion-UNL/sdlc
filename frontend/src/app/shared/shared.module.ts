import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '@app/_components/pagination/pagination.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ModalComponent } from '@app/_components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { EmptyComponent } from '../_components/empty/empty.component';

@NgModule({
  declarations: [    
    PaginationComponent,
    ModalComponent,
    EmptyComponent,
  ],
  imports: [
    CommonModule,    
    NgxPaginationModule,
    FormsModule,
  ],
  exports: [ 
    PaginationComponent ,
    EmptyComponent,
  ]
})
export class SharedModule { }
