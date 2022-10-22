import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from "file-saver";

import { ModalComponent } from '@app/_components/modal/modal.component';
import { User } from '@app/_models/user';
import { Activity } from '@app/_models/activity';
import { Change } from '@app/_models/change';
import { ActivityService } from '@app/_services/activity.service';
import { AuthenticationService } from '@app/_services/auth.service';
import { Attachment } from '@app/_models/attachment';
import { AttachmentService } from '@app/_services/attachment.service';
import { EditActivityResponsibleComponent } from '@app/project/components/edit-activity-responsible/edit-activity-responsible.component';
import { MemberService } from '@app/_services/member.service';
import { Project } from '@app/_models/project';
import { ProjectService } from '@app/_services/project.service';

@Component({
  selector: 'app-project-activities',
  templateUrl: './project-activities.component.html',
  styleUrls: ['./project-activities.component.scss']
})
export class ProjectActivitiesComponent implements OnInit {

  user: User = {};
  activity_id: string;
  project_id: string;
  activity: Activity = {};
  project: Project;
  urlAttachment: Attachment = {};
  fileAttachment: Attachment = {};
  changes: Change[];
  subactivities: Activity[] = [];
  incidences: Activity[] = [];
  is_activity: boolean = false;
  is_subactivity: boolean = false;
  is_incidence: boolean = false;
  urlAttachments: Attachment[] = [];
  fileAttachments: Attachment[] = [];
  subcomponents: boolean;
  user_id: string;
  can_delete_activity: boolean;
  can_delete_subactivity: boolean;
  can_delete_incidence: boolean;
  can_discard_activity: boolean;
  aux = false;

  formSubactivities: FormGroup;
  formStatus: FormGroup;
  formPriority: FormGroup;
  formStartDate: FormGroup;
  formFinishDate: FormGroup;
  show: boolean = true;
  submitted: boolean = false;

  loading_activity: boolean = false;
  loading_subactivities: boolean = false;
  loading_incidences: boolean = false;
  loading_attachments: boolean = false;
  disabled: boolean = false;

  status_options = ['Por Hacer', 'En Curso', 'Finalizada'];
  priority_options = ['Baja', 'Media', 'Alta'];

  delay: number = 0;

  now: Date = new Date();

  config = {
    itemsPerPage: 2,
    currentPage: 1,
  };

  steps = [
    {
      step: 'activities', title: 'Gestionar Actividad',
      text: `En esta sección se puede administrar toda la información relacionada a una actividad en específico.`
    },
    {
      step: 'subactivities', title: 'Gestionar Subactividad',
      text: `En esta sección se puede administrar toda la información relacionada a una subactividad en específico.`
    },
    {
      step: 'incidences', title: 'Gestionar Incidencia',
      text: `En esta sección se puede administrar toda la información relacionada a una incidencia en específico.`
    },
    {
      step: 'description', title: 'Descripción',
      text: `En este campo puedes agregar una descripción de la actividad, subactividad o incidencia. 
      Para seguir la metodología XP es recomendable poner la historia de usuario en la actividad.`
    },
    {
      step: 'status', title: 'Estado',
      text: `En este campo puedes actualizar el estado del desarrollo de la actividad, subactividad o incidencia.`
    },
    {
      step: 'priority', title: 'Prioridad',
      text: `En este campo puedes establecer la prioridad que tiene la actividad, subactividad o incidencia.`
    },
    {
      step: 'responsables', title: 'Responsables',
      text: `Puedes asignar uno o varios responsables para desarrollar la actividad, subactividad o incidencia.`
    },
    {
      step: 'dates', title: 'Fecha de Inicio y Fecha de Finalización',
      text: `Puedes modificar las fechas de inicio y finalización de la actividad, subactividad o incidencia.`
    },
    {
      step: 'create-subactivities', title: 'Crear Subactividades',
      text: `Puedes crear subactividades para especificar tareas más específicas dentro de la actividad.`
    },
    {
      step: 'create-incidences', title: 'Crear Incidencias',
      text: `Puedes crear incidencias para especificar problemas a solucionar dentro del desarrollo de la actividad.`
    },
    {
      step: 'create-tasks', title: 'Administrar Tareas',
      text: `Puedes crear tareas pequeñas a desarrollar dentro de la subactividad o de la incidencia. En caso de que ya se cumpla
      se puede marcar como completado.`
    },
    {
      step: 'external-link', title: 'Administrar Enlaces Externos',
      text: `Puedes crear, modificar y dar de baja enlaces externos que pueden ser relevantes dentro de la actividad.`
    },
    {
      step: 'attached-file', title: 'Administrar Archivos Externos',
      text: `Puedes crear, modificar y dar de baja archivos externos que pueden ser relevantes dentro de la actividad.
      Adicionalmente los demás colaboradores pueden descargar los archivos que adjuntes.`
    },
    {
      step: 'commentaries', title: 'Emitir Comentarios',
      text: `Puedes emitir comentarios para retroalimentar aspectos dentro de la actividad, subactividad o incidencia. 
      Puedes modificar o dar de baja tus comentarios y visualizar los comentarios de los demás colaboradores`
    },
    {
      step: 'history', title: 'Historial de Cambios',
      text: `Puedes visualizar todos los cambios realizados y la persona que lo ha realizado dentro de la actividad.`
    },
    {
      step: 'delete', title: 'Dar de Baja',
      text: `Puedes dar de baja la actividad, subactividad o incidencia en caso de ser necesario.`
    }
  ];

  constructor(
    private routeActive: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private toastr: ToastrService,
    private activityService: ActivityService,
    private projectService: ProjectService,
    private attachmentService: AttachmentService,
    private memberService: MemberService,
    private modalService: NgbModal,
  ) {
    this.now.setFullYear(this.now.getFullYear() - 2);
  }

  ngOnInit(): void {
    this.activity_id = this.routeActive.snapshot.params['id'];
    this.project_id = this.routeActive.parent.snapshot.params['project'];
    this.user_id = this.authService.currentUserValue.id;
    this.fetchActivity();
    this.fetchProject();
    this.fetchSubactivities();
    this.fetchIncidences();
    this.fetchChangesByActivity();
    this.fetchAttachments();
    this.isAuthorized();
    this.formStatus = new FormGroup({
      status: new FormControl()
    });

    this.formPriority = new FormGroup({
      priority: new FormControl()
    });

    this.formStartDate = new FormGroup({
      start_date: new FormControl()
    });

    this.formFinishDate = new FormGroup({
      finish_date: new FormControl()
    });
  }

  fetchProject() {
    this.projectService.get(this.project_id)
      .pipe(first())
      .subscribe({
        next: res => {
          this.project = res;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        }
      });
  }

  //Obtener Actividad, Subactividad o Incidencia
  fetchActivity() {
    this.loading_activity = true;
    this.activityService.getActivity(this.activity_id).pipe(first()).subscribe({
      next: res => {
        this.activity = res;
        this.subcomponents = (this.activity.parent) ? false : true;
        if (!this.activity.parent) {
          this.is_activity = true;
        } else if (!this.activity.incidence) {
          this.is_subactivity = true;
        } else {
          this.is_incidence = true;
        }
        this.formStatus.get('status').setValue(this.activity.status);
        this.formPriority.get('priority').setValue(this.activity.priority);
        this.formStartDate.get('start_date').setValue(formatDate(this.activity.start_date, 'yyyy-MM-dd', 'en', '+0000'));
        this.formFinishDate.get('finish_date').setValue(formatDate(this.activity.finish_date, 'yyyy-MM-dd', 'en', '+0000'));
        this.loading_activity = false;                   
        if (this.activity?.iteration?.finished || !this.activity?.project?.active || this.activity?.discard) {
          this.disabled = true;
        }
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.loading_activity = false;
      }
    })
  }

  //Mostrar Comentarios o Historial de Cambios
  toggle(value: boolean) {
    this.show = value;
  }

  // -------------------------  Subactividades -------------------------
  //Obtener Subactividades
  fetchSubactivities() {
    this.loading_subactivities = true;
    this.activityService.getSubactivities(this.activity_id).pipe(first()).subscribe({
      next: res => {
        this.subactivities = res;
        this.loading_subactivities = false;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.loading_subactivities = false;
      }
    });
  }

  //Actualizar listado de Subactividades
  addToSubactivities(subactivity: Activity) {
    this.subactivities.push(subactivity);
  }

  // -------------------------  Incidencias -------------------------
  //Obtener Incidencias
  fetchIncidences() {
    this.loading_incidences = true;
    this.activityService.getIncidences(this.activity_id).pipe(first()).subscribe({
      next: res => {
        this.incidences = res;
        this.loading_incidences = false;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.loading_incidences = false;
      }
    });
  }

  //Actualizar listado de Incidencias
  addToIncidences(incidence: Activity) {
    this.incidences.push(incidence);
  }

  // -------------------------  Tareas -------------------------
  tasks(activity: Activity) {
    this.fetchActivity();
  }

  // -------------------------  Campo Estado -------------------------
  //Actualizar Estado
  updateStatus(event) {
    let statusValue = (event.target.value).split(':');
    const change = this.setChange('Estado', this.activity.status, statusValue[1].trim());
    let data: Activity = {
      status: statusValue[1].trim(),
      change: change
    } 
    if (statusValue[1].trim() === "Finalizada") {
      data.finish_real_date = new Date(Date.now());
    }

    this.activityService.edit(data, this.activity_id).pipe(first()).subscribe({
      next: res => {
        this.toastr.success("Se ha actualizado el estado correctamente.", null, { positionClass: 'toast-bottom-center' });
        //this.fetchActivity();
        this.fetchChangesByActivity();
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }

  // -------------------------  Campo Prioridad -------------------------
  //Actualizar Prioridad
  updatePriority(event) {
    let priorityValue = (event.target.value).split(':');
    const change = this.setChange('Prioridad', this.activity.priority, priorityValue[1].trim());
    const data: Activity = {
      priority: priorityValue[1].trim(),
      change: change
    }

    this.activityService.edit(data, this.activity_id).pipe(first()).subscribe({
      next: res => {
        this.toastr.success("Se ha actualizado la prioridad correctamente.", null, { positionClass: 'toast-bottom-center' });
        //this.fetchActivity();
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }

  // -------------------------  Campo Fecha de Finalización -------------------------
  //Actualizar Fecha de Finalización
  updateStartDate(event) {
    let start_date_value = new Date(event.target.value);

    let new_s = new Date(start_date_value);
    let ite_s = new Date(this.activity?.iteration?.start_date);
    let ite_f = new Date(this.activity?.iteration?.finish_date);

    if(!this.activity?.iteration?.start_date || !this.activity?.iteration?.finish_date || (new_s >= ite_s && new_s <= ite_f)) {
      const change = this.setChange('Fecha de Finalización', this.activity.start_date, start_date_value);
  
      var data: Activity;
  
      if (new Date(start_date_value) > new Date(this.activity.finish_date)) {
        data = {
          start_date: start_date_value,
          finish_date: start_date_value,
          change: change
        }
        this.activity.finish_date = start_date_value;
        this.formFinishDate.get('finish_date').setValue(formatDate(this.activity.finish_date, 'yyyy-MM-dd', 'en', '+0000'));
      } else {
        data = {
          start_date: start_date_value,
          change: change
        }
      }
  
      this.activityService.edit(data, this.activity_id).pipe(first()).subscribe({
        next: res => {
          this.toastr.success("Se ha actualizado la fecha de inicio de la actividad", null, { positionClass: 'toast-bottom-center' });
          //this.fetchActivity();
          this.activity.start_date = start_date_value;
          this.fetchChangesByActivity();
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        }
      });
    } else {
      this.formStartDate.get('start_date').setValue(formatDate(this.activity.start_date, 'yyyy-MM-dd', 'en', '+0000'));
      this.toastr.error('Fecha fuera del límite establecido por la iteración', null, { positionClass: 'toast-bottom-center' });
    }
  }

  //Actualizar Fecha de Finalización
  updateFinishDate(event) {
    let finish_date_value = new Date(event.target.value);

    let new_f = new Date(finish_date_value);
    let ite_s = new Date(this.activity?.iteration?.start_date);
    let ite_f = new Date(this.activity?.iteration?.finish_date);
    
    if(!this.activity?.iteration?.finish_date || !this.activity?.iteration?.start_date || (new_f >= ite_s && new_f <= ite_f)) {
      const change = this.setChange('Fecha de Finalización', this.activity.finish_date, finish_date_value);
      var data: Activity;
  
      if (new Date(finish_date_value) < new Date(this.activity.start_date)) {
        data = {
          start_date: finish_date_value,
          finish_date: finish_date_value,
          change: change
        }
        this.activity.start_date = finish_date_value;
        this.formStartDate.get('start_date').setValue(formatDate(this.activity.start_date, 'yyyy-MM-dd', 'en', '+0000'));
      } else {
        data = {
          finish_date: finish_date_value,
          change: change
        }
      }
  
      this.activityService.edit(data, this.activity_id).pipe(first()).subscribe({
        next: res => {
          this.toastr.success("Se ha actualizado la fecha de finalización de la actividad", null, { positionClass: 'toast-bottom-center' });
          //this.fetchActivity();
          this.activity.finish_date = finish_date_value;
          this.fetchChangesByActivity();
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        }
      });
    } else {
      this.formFinishDate.get('finish_date').setValue(formatDate(this.activity.finish_date, 'yyyy-MM-dd', 'en', '+0000'));
      this.toastr.error('Fecha fuera del límite establecido por la iteración', null, { positionClass: 'toast-bottom-center' });
    }
  }

  // -------------------------  Historial de Cambios -------------------------
  //Obtener Historial de la actividad
  fetchChangesByActivity() {
    this.activityService.getChanges(this.activity_id).pipe(first()).subscribe({
      next: res => {
        this.changes = res;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }

  //Asignar Valores al cambio
  private setChange(attribute, previous_value, new_value) {
    return {
      attribute_type: attribute,
      previous_value: previous_value,
      new_value: new_value,
      activity: this.activity_id
    }
  }

  openResponsible() {
    const modalRef = this.modalService.open(EditActivityResponsibleComponent, { centered: true, keyboard: false, backdrop: 'static' });
    modalRef.componentInstance.project_id = this.project_id;
    modalRef.componentInstance.activity_id = this.activity_id;
    modalRef.componentInstance.assigned = this.activity.responsable;
    modalRef.componentInstance.roles = this.activity.roles;
    modalRef.componentInstance.disabled = this.disabled;

    modalRef.dismissed.subscribe({
      next: res => {
        if (res) {
          this.activity.responsable = res.responsable;
          this.activity.roles = res.roles;
        }
      }
    });
  }

  //-----------------------------Elementos Adjuntos-----------------------

  fetchAttachments() {
    this.loading_attachments = true;
    this.attachmentService.getAll(this.activity_id).pipe(first()).subscribe({
      next: attachments => {
        this.urlAttachments = attachments.filter(x => x.type === "url");
        this.fileAttachments = attachments.filter(x => x.type === "file");
        this.loading_attachments = false;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.loading_attachments = false;
      }
    });
  }

  addToUrlAttachment(attachment: Attachment) {
    if (this.urlAttachments.find(x => x._id === attachment._id)) {
      this.urlAttachments.push(attachment);
    }
    this.fetchAttachments();
  }

  addToFileAttachment(attachment: Attachment) {
    if (this.fileAttachments.find(x => x._id === attachment._id)) {
      this.fileAttachments.push(attachment);
    }
    this.fetchAttachments();
  }

  editAttachment(attachment: Attachment) {
    if (attachment.type === 'url') {
      this.urlAttachment = attachment;
    } else {
      this.fileAttachment = attachment;
    }
    this.fetchAttachments();
  }

  downloadAttachment(attachment: Attachment) {
    this.toastr.info("Descargando archivo...", null, { positionClass: 'toast-bottom-center' });
    this.attachmentService.getFile(attachment.url).pipe(first()).subscribe({
      next: result => {
        let blob = new Blob([result], { type: result.type });
        let url = window.URL.createObjectURL(blob);
        let ext = result.type.split('/')[1];
        saveAs(url,Date.now()+'.'+ext);
        //window.open(url);
        //this.toastr.success("Se ha generado el reporte correctamente", null, { positionClass: 'toast-bottom-center' });
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }

  //-------------------------------Dar de baja Actividad ---------------------------
  deleteActivity(activity: Activity) {
    let type = "";
    if (!activity.parent) {
      type = "actividad";
    } else if (!activity.incidence) {
      type = "subactividad";
    } else {
      type = "incidencia";
    }

    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Dar de baja ` + type,
      message: `La ` + type + ` será dada de baja. Recuerda que esta acción es irreversible. ¿Deseas Continuar?`,
      withReason: false,
    };

    modalRef.closed.subscribe({
      next: val => {
        if (val) {
          const data: Activity = {
            _id: activity._id,
            active: false,
            type: type
          };
          this.activityService.remove(data).pipe(first()).subscribe({
            next: res => {
              this.toastr.success(`La ` + type + ` ha sido dada de baja correctamente.`, null, { positionClass: 'toast-bottom-center' });
              this.router.navigate(['/manager/project/', this.project_id, 'planning']);
            },
            error: err => {
              this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            }
          });
        }
      }
    });
  }

  //Determinar si el usuario tiene permiso para acceder a los ajustes del proyecto
  isAuthorized() {
    this.memberService.getAll(this.project_id)
      .pipe(first())
      .subscribe({
        next: res => {                  
          if (this.is_activity) {
            res.forEach(element => {
              element?.role?.permissions.forEach(el => {
                if (el === 1 || el === 6) {
                  if (element.user._id === this.user_id) {
                    this.can_delete_activity = true;
                  }
                }
              });
            });
          } else if (this.is_subactivity) {
            res.forEach(element => {
              element?.role?.permissions.forEach(el => {
                if (el === 1 || el === 7) {
                  if (element.user._id === this.user_id) {
                    this.can_delete_subactivity = true;
                  }
                }
              });
            });
          } else if (this.is_incidence) {
            res.forEach(element => {
              element?.role?.permissions.forEach(el => {
                if (el === 1 || el === 8) {
                  if (element.user._id === this.user_id) {
                    this.can_delete_incidence = true;
                  }
                }
              });
            });
          }

          if (this.activity.iteration?.started) {    
            this.can_delete_activity = false;
            this.can_delete_subactivity = false;
            this.can_delete_incidence = false;
            this.can_discard_activity = true;
          }
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        },
      });
  }

  refreshName(name: string) {
    this.activity.name = name;
  }

  removeHTMLTags(input: string) {
    return input?.replace(/(<([^>]+)>)/ig, ' ') || 'Nada';
  }

  getLimitDate(date: Date): string {
    return formatDate(date,'yyyy-MM-dd', 'en').toString();
  }

  //-------------------------------Descartar Actividad ---------------------------
  
  discardActivity() {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: 'Descartar la Actividad',
      message: 'La actividad será descartada. Recuerda que esta acción es irreversible. ¿Deseas Continuar?',
      withReason: true,
    };

    modalRef.closed.subscribe({
      next: val => {
        if (val) {
          this.activityService.discard(this.activity_id, val).pipe(first()).subscribe({
            next: res => {
              this.toastr.success(`La actividad ha sido descartada correctamente.`, null, { positionClass: 'toast-bottom-center' });
              this.router.navigate(['manager/project/', this.project_id, 'planning', 'iteration', this.activity.iteration._id]);
            },
            error: err => {
              this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            }
          });
        }
      }
    });
  }

}
