import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Activity } from '@app/_models/activity';
import { ActivityService } from '@app/_services/activity.service';
import { AngularEditorComponent, AngularEditorConfig } from '@kolkov/angular-editor';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-edit-activity-description',
  templateUrl: './edit-activity-description.component.html',
  styleUrls: ['./edit-activity-description.component.scss']
})
export class EditActivityDescriptionComponent implements OnInit {
  @ViewChild('refEditor') refEditor: ElementRef<AngularEditorComponent>;
  @Input() description: string;
  @Input() activity_id: string;
  @Input() disabled: boolean;
 
  @Output() changes = new EventEmitter();

  show: boolean = false;
  prev: string = '';
  
  editorConfig: AngularEditorConfig = {
    editable: true,
    height: '150px',
    maxHeight: '150px',
    toolbarHiddenButtons: [[],['insertVideo','insertImage']],
    outline: false,
  };
  
  constructor(
    private toastr: ToastrService,
    private activityService: ActivityService,
  ) { }

  ngOnInit(): void {
  }

  showInput(val: boolean) {
    this.show = (this.disabled) ? !val : val;
    
    if(val) {
      this.prev = this.description?.slice();
      setTimeout(() => {
        this.refEditor.nativeElement?.focus();
      }, 0);
    }else{
      this.description = this.prev?.slice();
    }
  }
  
  update() {
    if(this.prev !== this.description){
      const data: Activity = {
        change: {
          attribute_type: 'Descripción',
          previous_value: this.prev || "No existe descripción previa",
          new_value: this.description,
          activity: this.activity_id,
        },
        _id: this.activity_id,
        description: this.description,
      }
  
      this.activityService.edit(data, this.activity_id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.show = false;
            this.changes.emit();
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          }
        });
    }else{
      this.show = false;
    }
  }

}
