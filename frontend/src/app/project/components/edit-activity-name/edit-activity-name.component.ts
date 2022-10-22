import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Activity } from '@app/_models/activity';
import { ActivityService } from '@app/_services/activity.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-edit-activity-name',
  templateUrl: './edit-activity-name.component.html',
  styleUrls: ['./edit-activity-name.component.scss']
})
export class EditActivityNameComponent implements OnInit {
  @ViewChild('refInput') refInput: ElementRef<HTMLInputElement>;
  @Input() name: string;
  @Input() activity_id: string;

  @Output() changes = new EventEmitter();
  @Output() emit_name = new EventEmitter<string>();
  
  show: boolean = false;
  aux: string;
  constructor(
    private toastr: ToastrService,
    private activityService: ActivityService,
  ) { }

  ngOnInit(): void {    
  }

  showInput(val: boolean) {
    this.show = val;
    if(val) {
      this.aux = this.name.slice();
      setTimeout(() => {
        this.refInput.nativeElement.focus();
      }, 0);
    }else{
      if(!this.name)
        this.name = this.aux?.slice();      
    }
  }
  
  onSubmit() {
    if(!this.name) {
      this.toastr.error("¡El campo no debe estar vacío!", null, { positionClass: 'toast-bottom-center' });
      return;
    }

    let data: Activity = {
      change: {
        attribute_type: 'Nombre',
        previous_value: this.aux || "No existe valor previo",
        new_value: this.name,
        activity: this.activity_id,
      },
      _id: this.activity_id,
      name: this.name,
    }
    
    this.activityService.edit(data, this.activity_id)
      .pipe(first())
      .subscribe({
        next: res => {
          this.show = false;
          this.changes.emit();
          this.emit_name.emit(this.name);
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        }
      });
  }
}
