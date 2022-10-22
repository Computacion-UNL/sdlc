import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Activity } from '@app/_models/activity';
import { Change } from '@app/_models/change';
import { Task } from '@app/_models/task';
import { ActivityService } from '@app/_services/activity.service';
import { AuthenticationService } from '@app/_services/auth.service';
import { MemberService } from '@app/_services/member.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.scss']
})
export class CreateActivityComponent implements OnInit {

  @Input() project_id: string;
  @Input() iteration_id: string;
  @Input() activity_id: string;
  @Input() phase: string;
  @Input() incidence: boolean;
  @Input() task: boolean;
  @Input() s_date: Date;

  @Output() refresh = new EventEmitter<Activity>();
  @Output() e_changes = new EventEmitter();

  @ViewChild('refInput') refInput: ElementRef<HTMLInputElement>;
  show: boolean = false;
  submitted: boolean = false;
  loading: boolean = false;

  placeholder_text: string;
  button_text: string;
  option: string;
  user_id: string;
  is_manager: boolean = false;
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private activityService: ActivityService,
    private memberService: MemberService,
    private authService: AuthenticationService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.setTypeOptions();
    this.user_id = this.authService.currentUserValue.id;
    this.getCollaborator();
    this.form = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  get fa() { return this.form.controls }

  //Asignar el texto correspondiente a cada elemento según su tipo(Actividad, Subactividad, Incidencia, Tarea)
  private setTypeOptions() {
    if (this.activity_id && this.incidence) {
      this.placeholder_text = "Ingresar Incidencia";
      this.button_text = "+ Añadir Incidencia";
      this.option = "Incidencia";
    } else if (this.activity_id && !this.incidence) {
      if (this.task) {
        this.placeholder_text = "Ingresar Tarea";
        this.button_text = "+ Añadir Tarea";
        this.option = "Tarea";
      } else {
        this.placeholder_text = "Ingresar Subactividad";
        this.button_text = "+ Añadir Subactividad";
        this.option = "Subactividad";
      }
    } else {
      this.placeholder_text = "Ingresar Actividad";
      this.button_text = "+ Añadir Nueva Actividad";
      this.option = "Actividad";
    }
  }

  //Asignar la información de acuerdo a su tipo
  private setActivityInformation() {
    let data: Activity = {};
    switch (this.option) {
      case "Actividad":
        data.phase = this.phase;
        data.incidence = false;
        if (this.iteration_id)
          data.iteration = this.iteration_id;
        break;
      case "Subactividad":
        data.iteration = this.iteration_id;
        data.parent = this.activity_id;
        data.incidence = false;
        break;
      case "Incidencia":
        data.iteration = this.iteration_id;
        data.parent = this.activity_id;
        data.incidence = true;
        break;
      default:
        break;
    }

    data.project = this.project_id;
    data.name = this.fa['name'].value;
    data.priority = 'Media';

    let today = new Date();
    let sd = this.s_date ? new Date(this.s_date) : new Date();
    data.start_date = today > sd ? today : sd;
    data.finish_date = today > sd ? today : sd;
    data.created_by_manager = this.is_manager;
    return data;
  }

  private setTaskInformation() {
    let change: Change = {
      attribute_type: 'Tarea',
      previous_value: 'Sin Valor Previo',
      new_value: this.fa['name'].value,
      activity: this.activity_id
    };

    let task: Task[] = [{
      task: this.fa['name'].value
    }];

    let data: Activity = {
      _id: this.activity_id,
      change: change,
      tasks: task
    };

    return data;
  }

  //Almacenar la información de acuerdo al tipo
  onSubmit() {
    this.submitted = true;
    if (this.form.invalid)
      return;

    this.loading = true;
    if (this.task) {
      const data = this.setTaskInformation();
      this.activityService.edit(data, data._id).pipe(first()).subscribe({
        next: (res: any) => {
          this.toastr.success("Se agrego la tarea satisfactoriamente.", null, { positionClass: 'toast-bottom-center' });
          this.refresh.emit(res);
          this.toggle(false);
          this.resetForm();
          this.e_changes.emit();
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
    } else {
      const data = this.setActivityInformation();
      this.activityService.add(data).pipe(first()).subscribe({
        next: (res: any) => {
          this.toastr.success("La actividad ha sido creado satisfactoriamente.", null, { positionClass: 'toast-bottom-center' });
          this.refresh.emit(res.activity);
          this.toggle(false);
          this.resetForm();
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
    }
  }

  //Método que se llama cuando el campo de texto esta activo/desactivado
  toggle(val: boolean) {
    this.show = val;
    if (this.show) {
      setTimeout(() => {
        this.refInput.nativeElement.focus();
      }, 0);
    } else {
      this.resetForm();
    }
  }

  //Resetea el campo de texto
  resetForm() {
    this.form.reset();
    this.loading = false;
    this.submitted = false;
  }

  getCollaborator() {
    if(this.project_id && this.user_id) {
      this.memberService.getMember(this.project_id, this.user_id)
        .pipe(first())
        .subscribe({
          next: res => {
            if (res.role.name === "Gestor") {
              this.is_manager = true;
            }
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading = false;
          },
        });
    }
  }
}
