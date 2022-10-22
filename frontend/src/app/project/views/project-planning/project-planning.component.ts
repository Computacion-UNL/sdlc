import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first, pipe } from 'rxjs';

import { Iteration } from '@app/_models/iteration';
import { Activity } from '@app/_models/activity';
import { IterationService } from '@app/_services/iteration.service';
import { ActivityService } from '@app/_services/activity.service';
import { DataService } from '@app/_services/data.service';
import { ModalComponent } from '@app/_components/modal/modal.component';

import { CreateIterationComponent } from '@app/project/components/create-iteration/create-iteration.component';
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import { InitIterationComponent } from '@app/project/components/init-iteration/init-iteration.component';
import { ModalIterationsComponent } from '@app/project/components/modal-iterations/modal-iterations.component';
import { MemberService } from '@app/_services/member.service';
import { AuthenticationService } from '@app/_services/auth.service';
import { Project } from '@app/_models/project';
import { ProjectService } from '@app/_services/project.service';
import { AddToIterationComponent } from '@app/project/components/add-to-iteration/add-to-iteration.component';
import { AddNewActivityComponent } from '@app/project/components/add-new-activity/add-new-activity.component';

interface DropzoneLayout {
  container: string;
  list: string;
  dndHorizontal: boolean;
}

@Component({
  selector: 'app-project-planning',
  templateUrl: './project-planning.component.html',
  styleUrls: ['./project-planning.component.scss']
})
export class ProjectPlanningComponent implements OnInit {
  // DRAG AND DROP
  private readonly verticalLayout: DropzoneLayout = {
    container: "row",
    list: "column",
    dndHorizontal: false
  };

  layout: DropzoneLayout = this.verticalLayout;

  // GENERAL
  loading_iterations: boolean = false;
  loading_backlog: boolean = false;

  fetched: boolean = false;
  submitted: boolean = false;

  project_id: string;
  project: Project;
  iteration_id: string;
  user_id: string;

  iteration: Iteration;
  iterations: Iteration[] = [];
  backlog: Activity[] = [];

  disabled: boolean = false;
  disabled_btn: boolean = false;

  //Permisos
  can_edit_iteration: boolean;
  can_delete_iteration: boolean;
  can_asign_score: boolean;

  is_manager: boolean = false;

  // Descripción Tour
  steps = [
    {
      step: 'create-iteration', title: 'Crear Iteración',
      text: `Una iteración cuenta con las fases de la metodología XP en las cuales se puede almacenar varias actividades dentro del proyecto.
      En la metodología XP al finalizar una iteración se tiene un incremento (parte funcional) del proyecto.`
    },
    {
      step: 'backlog', title: 'Actividades de Reserva',
      text: `En caso de que no se sepa con precisión la iteración donde debe ir la actividad se puede 
      crearla en la zona de actividades de reserva, hasta asignar dentro de una iteración.`
    },
    {
      step: 'activity-create', title: 'Crear Actividad',
      text: `Una actividad dentro del sistema es una acción que se debe llevar a cabo dentro del proceso de la metodología XP para
      cumplir con el desarrollo del proyecto. Algunas actividades pueden ser la generación de historias de usuario, diseño mediante tarjetas CRC,
      entre otras.`
    }
  ];

  phases: { code: string, name: string }[] = [
    { code: 'planning', name: 'Análisis' }, 
    { code: 'design', name: 'Diseño' }, 
    { code: 'coding', name: 'Codificación' },
    { code: 'testing', name: 'Pruebas' },
  ];

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private projectService: ProjectService,
    private iterationService: IterationService,
    private activityService: ActivityService,
    private memberService: MemberService,
    private authService: AuthenticationService,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.project_id = this.route.parent.parent.snapshot.params['project'];
    this.dataService.sendData(this.project_id);
    this.user_id = this.authService.currentUserValue.id;
    this.fetchProject();
  }

  //Obtener información del Proyecto
  fetchProject() {
    this.projectService.get(this.project_id).pipe(first()).subscribe({
      next: res => {
        this.project = res;
        if(!this.project.iteration) {
          if (!this.project.active) {
            this.disabled = true;
          }
          this.fetchIterations();
          this.isAuthorized();
        }else {
          this.memberService.getMember(this.project_id, this.user_id)
            .pipe(first()).subscribe({
              next: res => {
                if (res.role?.slug === 'manager') {
                  this.is_manager = true;
                  this.fetchIterations();
                  this.isAuthorized();
                } else {
                  this.router.navigate(['iteration', this.project.iteration], { relativeTo: this.route });
                }
              },
              error: err => {
                this.toastr.error('Ha ocurrido un error. Actualiza e intenta de nuevo.', null, { positionClass: 'toast-bottom-center' });
              }
            });
        }
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    })
  }

  //Obtener listado de iteraciones
  fetchIterations() {
    if (this.project_id) {
      this.loading_iterations = true;
      this.iterationService.getAll(this.project_id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.fetched = true;
            this.iterations = res;
            if(this.iterations?.length > 0) {
              var limit = this.iterations.length || 0;
              var count = 0;
  
              for(let iteration of this.iterations) {
                this.activityService.getAll(iteration._id)
                .pipe(first())
                .subscribe({
                  next: activities => {
                    iteration.countf = activities.filter(a => a.status == 'Finalizada')?.length || 0;
                    iteration.counta = activities.length - iteration.countf;
                    
                    iteration.activities = activities;
                    
                    iteration.planning = activities.filter(a => a.phase == 'planning');

                    iteration.planning?.sort((a, b) => this.getTime(a.start_date) - this.getTime(b.start_date));
                    iteration.planning?.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

                    iteration.design = activities.filter(a => a.phase == 'design');

                    iteration.design?.sort((a, b) => this.getTime(a.start_date) - this.getTime(b.start_date));
                    iteration.design?.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

                    iteration.coding = activities.filter(a => a.phase == 'coding');

                    iteration.coding?.sort((a, b) => this.getTime(a.start_date) - this.getTime(b.start_date));
                    iteration.coding?.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

                    iteration.testing = activities.filter(a => a.phase == 'testing');

                    iteration.testing?.sort((a, b) => this.getTime(a.start_date) - this.getTime(b.start_date));
                    iteration.testing?.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

                    count++;
                    if(count >= limit) {
                      this.loading_iterations = false;
                    }
                  },
                  error: err => {
                    this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
                    count++;
                    if(count >= limit) {
                      this.loading_iterations = false;
                    }
                  }
                });
              }
            }else {
              this.loading_iterations = false;
            }
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading_iterations = false;
          }
        });

      this.fetchBacklog();
    }
  }

  fetchBacklog() {
    if (this.project_id) {
      this.loading_backlog = true;
      this.activityService.getBacklog(this.project_id)
        .pipe(first())
        .subscribe({
          next: activities => {
            this.backlog = activities;
            
            this.backlog?.sort((a, b) => this.getTime(a.start_date) - this.getTime(b.start_date));
            this.backlog?.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

            this.loading_backlog = false;
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading_backlog = false;
          }
        });
    }
  }


  //Abrir Modal de Iteración
  open(data: Iteration) {
    const modalRef = this.modalService.open(CreateIterationComponent, { centered: true });
    modalRef.componentInstance.iteration = data;
    modalRef.componentInstance.objectives = this.project.specific_objectives;
    modalRef.componentInstance.project_id = this.project_id;

    modalRef.closed.subscribe({
      next: res => {
        if (res)
          this.fetchIterations();
      }
    });
  }

  openBacklog(list: Activity[], iteration: string, phase: string) {
    const modalRef = this.modalService.open(AddToIterationComponent, { centered: true });
    modalRef.componentInstance.activities = this.backlog;

    modalRef.closed.subscribe({
      next: (res) => {
        if(res) {
          let data = res as Activity;
          this.backlog = this.backlog.filter(x => data._id !== x._id);
          list.push(data);
          
          const change = this.setChange('Iteración', data.iteration || 'Nada', iteration || 'Nada', data._id);
          this.activityService.edit({ ...data, iteration: iteration, phase: phase, change }, data._id)
            .pipe(first())
            .subscribe({
              next: res => {
                this.toastr.success("Actividad modificada", null, { positionClass: 'toast-bottom-center' });
              },
              error: err => {
                this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              }
            });
        }else {
          const modalAddRef = this.modalService.open(AddNewActivityComponent, { centered: true });
          modalAddRef.componentInstance.iteration = iteration;
          modalAddRef.componentInstance.phase = phase;
          modalAddRef.componentInstance.project_id = this.project_id;

          modalAddRef.closed.subscribe({
            next: res => {
              if(res) {
                let data = res.activity as Activity;
                list.push(data);
              }
            }
          });
        }
      }
    });
  }

  //Dar de baja Iteración
  deleteIteration(data) {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Dar de baja Iteración`,
      message: `La iteración será dada de baja junto con todas sus actividades.
      Recuerda que esta acción es irreversible. ¿Deseas Continuar?`,
      withReason: false,
    };

    modalRef.closed.subscribe({
      next: val => {
        if (val) {
          this.iterationService.remove(data._id).pipe(first()).subscribe({
            next: res => {
              this.toastr.success("La iteración ha sido dada de baja satisfactoriamente.", null, { positionClass: 'toast-bottom-center' });
              this.fetchIterations();
            },
            error: err => {
              this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            }
          });
        }
      }
    });
  }

  initIteration(iter: Iteration) {
    let count = 0;
    for(let phase of this.phases) {
      let length = iter[phase.code]?.length || 0;
      count += length;
    }

    if(count > 0) {      
      const modalRef = this.modalService.open(InitIterationComponent, { centered: true });
      modalRef.componentInstance.msg = "Una vez iniciada la iteración no podrás modificar su información y actividades. ¿Deseas continuar?";
      modalRef.componentInstance.init = true;
  
      modalRef.closed.subscribe({
        next: res => {
          if (res) {
            this.iterationService.edit({ started: true }, iter._id)
              .pipe(first())
              .subscribe({
                next: res => {                
                  this.toastr.success("Iteración iniciada. Actualizando proyecto.", null, { positionClass: 'toast-bottom-center' });
                  iter.started = true;
                  this.projectService.edit({ id: this.project_id, iteration: iter._id })
                    .pipe(first())
                    .subscribe({
                      next: res => {                                         
                        this.router.navigate(['iteration', iter._id], { relativeTo: this.route });
                      },
                      error: err => {
                        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
                      }
                    });
                },
                error: err => {
                  this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
                }
              });
          }
        }
      });
    }else {
      this.toastr.error("La iteración no tiene actividades.", null, { positionClass: 'toast-bottom-center' });
    }
  }

  finishIteration(iter: Iteration) {
    if (iter.counta > 0) {
      this.toastr.error("No se puede finalizar la iteración, existen actividades sin terminar.", null, { positionClass: 'toast-bottom-center' });
    } else {
      const modalRef = this.modalService.open(InitIterationComponent, { centered: true });
      modalRef.componentInstance.msg = "Una vez finalizada la iteración no se podrá revertir la acción. ¿Deseas continuar?";
      modalRef.componentInstance.init = false;

      modalRef.closed.subscribe({
        next: res => {
          if (res) {
            this.iterationService.edit({ finished: true }, iter._id)
              .pipe(first())
              .subscribe({
                next: res => {
                  this.toastr.success("La iteración ha sido finalizada correctamente.", null, { positionClass: 'toast-bottom-center' });
                  iter.finished = true;
                },
                error: err => {
                  this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
                },
              })
          }
        }
      });
    }
  }

  //Asignar Calificación
  assignScore(data) {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Asignar Calificación a la Iteración`,
      message: `La calificación que asigne será vista por los demás colaboradores del equipo.
      Esta calificación únicamente podrá cambiarse por usted ¿Desea Continuar?`,
      withReason: true,
      placeholder: `Ingrese calificación (Números válidos del 0-10)`
    };

    modalRef.closed.subscribe({
      next: val => {
        if (val) {
          const iteration: Iteration = {
            score: val,
          };

          this.iterationService.edit(iteration, data._id)
            .pipe(first())
            .subscribe({
              next: res => {
                this.toastr.success("Se ha asignado la calificación a la iteración correctamente.", null, { positionClass: 'toast-bottom-center' });
                this.fetchIterations();
              },
              error: err => {
                this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              }
            });
        }
      }
    })
  }

  //Asigar id de iteracion
  setIteration(iteration) {
    this.iteration_id = iteration._id;
  }

  setBackground(status: string): string {
    var bg = '';

    switch (status) {
      case "Por Hacer":
        bg = 'bg_to-do';
        break;

      case "En Curso":
        bg = 'bg_in-progress';
        break;

      case "Finalizada":
        bg = 'bg_done';
        break;

      default:
        bg = 'bg_to-do'
        break;
    }

    return bg;
  }

  addToIteration(activity: Activity, phase: string) {
    const index = this.iterations.findIndex(x => x._id === activity.iteration);
    if (index > -1) {
      this.iterations[index][phase].push(activity);
    }
  }

  addToBacklog(activity: Activity) {
    this.backlog.push(activity);
  }

  private setChange(attribute: string, previous_value: any, new_value: any, id: string) {
    return {
      attribute_type: attribute,
      previous_value: previous_value,
      new_value: new_value,
      activity: id
    }
  }

  openIterationModal(iteration: string) {
    this.router.navigate(['individual-report', iteration], { relativeTo: this.route });
  }

  goToProcess(iteration: string) {
    this.router.navigate(['iteration', iteration], { relativeTo: this.route });
  }

  // DRAG AND DROP
  onDragStart(event: DragEvent) {
    //
  }

  onDragEnd(event: DragEvent) {
    //
  }

  onDragged(item: any, list: any[], effect: DropEffect) {
    if (!this.disabled) {
      if (effect === "move") {
        const index = list.indexOf(item);
        list.splice(index, 1);
      }
    }
  }

  onDrop(event: DndDropEvent, list?: any[], id?: string, phase?: string) {
    if (!this.disabled) {
      if (list && (event.dropEffect === "copy" || event.dropEffect === "move")) {
  
        let index = event.index;
  
        if (typeof index === "undefined") {
          index = list.length;
        }
  
        list.splice(index, 0, event.data);
  
        const change = this.setChange('Iteración', event.data.iteration || 'Nada', id || 'Nada', event.data._id);
        this.activityService.edit({ ...event.data, iteration: id, phase: phase, change }, event.data._id)
          .pipe(first())
          .subscribe({
            next: res => {
              this.toastr.success("Actividad modificada", null, { positionClass: 'toast-bottom-center' });
            },
            error: err => {
              this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            }
          });
      }
    }
  }

  //Determinar si el usuario tiene permiso para acceder a los ajustes del proyecto
  isAuthorized() {
    this.memberService.getAll(this.project_id)
      .pipe(first())
      .subscribe({
        next: res => {
          res.forEach(element => {
            element?.role?.permissions.forEach(el => {
              switch (el) {
                case 1:
                  if (element.user._id === this.user_id) {
                    this.can_edit_iteration = true;
                    this.can_delete_iteration = true;
                    this.can_asign_score = true;
                  }
                  break;
                case 2:
                  if (element.user._id === this.user_id) {
                    this.can_edit_iteration = true;
                  }
                  break;
                case 3:
                  if (element.user._id === this.user_id) {
                    this.can_delete_iteration = true;
                  }
                  break;
                default:
                  break;
              }
            });
          });
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        },
      });
  }

  private getTime(date?: Date) {
    return date != null ? new Date(date).getTime() : 0;
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'Alta':
        return 3;
        break;

      case 'Media':
        return 2;
        break;

      case 'Baja':
        return 1;
        break;
    
      default:
        return 1
        break;
    }
  }

}
