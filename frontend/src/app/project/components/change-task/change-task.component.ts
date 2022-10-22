import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Activity } from '@app/_models/activity';
import { Change } from '@app/_models/change';
import { Task } from '@app/_models/task';
import { ActivityService } from '@app/_services/activity.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-change-task',
  templateUrl: './change-task.component.html',
  styleUrls: ['./change-task.component.scss']
})
export class ChangeTaskComponent implements OnInit {

  @Input() task: Task;
  @Input() activity: Activity;
  show: boolean = true;
  submitted: boolean = false;
  loading: boolean = false;
  checked: boolean;
  form: FormGroup;

  @Output() refresh = new EventEmitter<Activity>();
  @Output() e_changes = new EventEmitter();
  @ViewChild('refInput') refInput: ElementRef<HTMLInputElement>;

  constructor(
    private formBuilder: FormBuilder,
    private activityService: ActivityService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.checked = (this.task.status === 'Completa') ? true : false;
    this.form = this.formBuilder.group({
      name: [this.task.task, Validators.required]
    });
  }

  get fa() { return this.form.controls }

  toggle(val: boolean) {
    this.show = val;
    if (this.show) {
      this.resetForm();
    } else {
      this.fa['name'].patchValue(this.task.task);
      setTimeout(() => {
        this.refInput.nativeElement.focus();
      }, 0);
    }
  }

  private setTaskInformation(previous_value: string, new_value: string, status?: string) {
    let change: Change = {
      attribute_type: (status) ? 'Estado de Tarea' :  'Tarea',
      previous_value: previous_value,
      new_value: new_value,
      activity: this.activity._id
    };

    let task: Task[] = [{
      _id: this.task._id,
      task: this.fa['name'].value,
      status: status,
      active: true
    }];

    let data: Activity = {
      _id: this.activity._id,
      change: change,
      tasks: task
    };

    return data;
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid)
      return;

    this.loading = true;
    const data = this.setTaskInformation(this.task.task,this.fa['name'].value);
    this.activityService.edit(data, data._id).pipe(first()).subscribe({
      next: (res: any) => {
        this.toastr.success("Se modifico la tarea satisfactoriamente.", null, { positionClass: 'toast-bottom-center' });
        this.refresh.emit(res);
        this.toggle(true);
        this.resetForm();
        this.e_changes.emit();
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.loading = false;
      }
    });
  }

  //Actualizar Estado de Tareas
  updateTaskStatus(event) {
    console.log(event.target.value);
    const status = (event.target.checked) ? "Completa" : "Incompleta";
    const data = this.setTaskInformation(this.task.status,status,status);

    this.activityService.edit(data, data._id).pipe(first()).subscribe({
      next: res => {
        this.toastr.success("Se ha actualizado el estado de la subactividad correctamente.", null, { positionClass: 'toast-bottom-center' });
        this.refresh.emit(res);
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }


  //Dar de baja Tarea
  deleteTask(task) {
    task.active = false;
    const tasks: Task[] = [task];
    const data: Activity = {
      _id: this.activity._id,
      tasks: tasks
    };

    this.activityService.edit(data, data._id).pipe(first()).subscribe({
      next: (res: any) => {
        this.toastr.success("Se dió de baja la tarea satisfactoriamente.", null, { positionClass: 'toast-bottom-center' });
        this.refresh.emit(res);
        this.toggle(true);
        this.resetForm();
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.loading = false;
      }
    });
  }

  //Resetea el campo de texto
  resetForm() {
    this.form.reset();
    this.loading = false;
    this.submitted = false;
  }

}
