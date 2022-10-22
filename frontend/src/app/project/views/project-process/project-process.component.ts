import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from '@app/_components/modal/modal.component';
import { Activity } from '@app/_models/activity';
import { Iteration } from '@app/_models/iteration';
import { Project } from '@app/_models/project';
import { ActivityService } from '@app/_services/activity.service';
import { IterationService } from '@app/_services/iteration.service';
import { ProjectService } from '@app/_services/project.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-project-process',
  templateUrl: './project-process.component.html',
  styleUrls: ['./project-process.component.scss']
})
export class ProjectProcessComponent implements OnInit {
  iteration_id: string;
  project_id: string;

  iteration: Iteration;
  project: Project;

  backlog: Activity[] = [];
  activities: Activity[] = [];
  phase_activities: Activity[] = [];

  loading_activities: boolean = false;
  loading_backlog: boolean = false;
  loading_phase: boolean = false;
  loading_finish: boolean = false;

  fetched: boolean = false;

  countf: number = 0;
  counta: number = 0;
  countt: number = 0;

  phases: { pos: number, code: string, name: string }[] = [
    { pos: 1, code: 'planning', name: 'Análisis' },
    { pos: 2, code: 'design', name: 'Diseño' },
    { pos: 3, code: 'coding', name: 'Codificación' },
    { pos: 4, code: 'testing', name: 'Pruebas' },
  ];

  phase: { pos: number, code: string, name: string } = this.phases[0];
  percentage: number = 0;

  // Descripción Tour
  steps = [
    {
      step: 'view-schedule', title: 'Ver Cronograma',
      text: `Al pulsar el botón se podrá ver las actividades planificadas dentro de la iteración a modo de cronograma.`
    },
    {
      step: 'activities-list', title: 'Actividades de la Fase',
      text: `En cada fase de la iteración correspondiente a la metodología XP, se listarán las actividades a junto con el estado en el
        que se encuentra.`
    },
    {
      step: 'activity-reserve', title: 'Reserva de Actividades',
      text: `En caso de requerirse actividades adicionales a las antes planificadas se podrá agregar una actividad y asignarla dentro de la 
      fase correspondiente. Nota: Una vez ingresada la actividad a una fase ya no se puede volver a ubicarla en la zona de Reserva de Actividades.`
    },
    {
      step: 'end-iteration', title: 'Finalizar Iteración',
      text: `Una vez que se haya cumplido con las actividades de la iteración se podrá finalizar la iteración pulsado el botón. Nota: Para pasar a
      cada siguiente fase es necesario cumplir con el 80% de las actividades, por lo que las actividades que no se hayan fializado volveran a la zona
      de Reserva de Actividades para usarse en la siguiente iteración.`
    }
  ];

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private projectService: ProjectService,
    private iterationService: IterationService,
    private activityService: ActivityService,
  ) { }

  ngOnInit(): void {
    this.project_id = this.route.parent.parent.snapshot.params['project'];
    this.iteration_id = this.route.snapshot.params['id'];
    this.fetchProject();
  }

  fetchProject() {
    this.projectService.get(this.project_id)
      .pipe(first())
      .subscribe({
        next: res => {
          this.project = res;
          if (this.project.iteration) {
            this.fetchIteration();
          } else {
            this.router.navigate(['../../'], { relativeTo: this.route });
          }
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        }
      });
  }

  fetchIteration() {
    this.iterationService.get(this.iteration_id)
      .pipe(first())
      .subscribe({
        next: res => {
          this.iteration = res;
          this.fetchActivities();
          this.fetchBacklog();
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        }
      });
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

  fetchActivities() {
    if (this.project_id) {
      this.loading_activities = true;
      this.activityService.getAll(this.iteration_id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.activities = res;

            this.activities = this.activities?.filter(a => !a.discard);

            this.phase = this.iteration.phase ? this.phases[this.iteration.phase] : this.phases[0];
            this.phase_activities = this.activities.filter(a => a.phase == this.phase.code);

            this.phase_activities?.sort((a, b) => this.getTime(a.start_date) - this.getTime(b.start_date));
            this.phase_activities?.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

            this.countf = this.phase_activities.filter(a => a.status == 'Finalizada')?.length || 0;
            this.counta = this.phase_activities.length - this.countf;
            this.countt = this.phase_activities.length;

            this.percentage = this.countf / this.countt * 100;

            this.loading_activities = false;
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading_activities = false;
          }
        });
    }
  }

  private getTime(date?: Date) {
    return date != null ? new Date(date).getTime() : 0;
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'Alta':
        return 3;

      case 'Media':
        return 2;

      case 'Baja':
        return 1;

      default:
        return 1
    }
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

  private setChange(attribute: string, previous_value: any, new_value: any, id: string) {
    return {
      attribute_type: attribute,
      previous_value: previous_value,
      new_value: new_value,
      activity: id
    }
  }

  addToBacklog(activity: Activity) {
    this.backlog.push(activity);
  }

  finishIteration() {
    this.loading_finish = true;
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Finalizar iteración`,
      message: `¿Estás seguro que deseas realizar esta acción? Una vez confirmada, no se puede revertir.`,
    };

    modalRef.closed.subscribe({
      next: res => {
        if (res) {
          if (this.checkActivities()) {
            let activities_not_finished = this.activities.filter(x => x.status !== 'Finalizada');

            var count = 0;
            var limit = activities_not_finished.length;

            if (limit > 0) {
              for (let activity of activities_not_finished) {
                const change = this.setChange('Iteración', activity.iteration || 'Nada', 'Desplazada al finalizar iteración', activity._id);
                this.activityService.edit({ ...activity, iteration: null, change }, activity._id)
                  .pipe(first())
                  .subscribe({
                    next: res => {
                      count++;
                      if (count >= limit) {
                        this.executeFinish();
                      }
                    },
                    error: err => {
                      this.toastr.error('Ha ocurrido un error al finalizar la iteración. Recarga e inténtalo de nuevo.', null, { positionClass: 'toast-bottom-center' });
                      this.loading_finish = false;
                    }
                  });
              }
            } else {
              this.executeFinish();
            }
          }
        }
      }
    });
  }

  checkActivities(): boolean {
    for (let phase of this.phases) {
      let activities = this.activities.filter(a => a.phase == phase.code);

      let countf = activities.filter(a => a.status == 'Finalizada')?.length || 0;
      let countt = activities.length;

      let percentage = countf / countt * 100;

      if (percentage < 80) {
        this.toastr.error(`¡Fase de ${phase.name} no completa!`, null, { positionClass: 'toast-bottom-center' });
        this.loading_finish = false;
        return false;
      }
    }

    return true;
  }

  private executeFinish() {
    this.iterationService.edit({ finished: true, phase: 0, finished_at: new Date() }, this.iteration_id)
      .pipe(first())
      .subscribe({
        next: res => {
          this.projectService.edit({ id: this.project_id, iteration: null })
            .pipe(first())
            .subscribe({
              next: res => {
                this.loading_finish = false;
                this.router.navigate(['../../', 'individual-report', this.project.iteration], { relativeTo: this.route });
              },
              error: err => {
                this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
                this.loading_finish = false;
              }
            });
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading_finish = false;
        }
      });
  }

  nextPhase() {
    this.phase = this.phases[this.phases.findIndex(p => p.code == this.phase.code) + 1];
    this.setPhase();
  }

  previousPhase() {
    this.phase = this.phases[this.phases.findIndex(p => p.code == this.phase.code) - 1];
    this.setPhase();
  }

  private setPhase() {
    this.loading_phase = true;
    this.iterationService.edit({ phase: this.phase.pos - 1 }, this.iteration_id)
      .pipe(first())
      .subscribe({
        next: res => {
          this.phase_activities = this.activities.filter(a => a.phase == this.phase.code);

          this.phase_activities?.sort((a, b) => this.getTime(a.start_date) - this.getTime(b.start_date));
          this.phase_activities?.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

          this.countf = this.phase_activities.filter(a => a.status == 'Finalizada')?.length || 0;
          this.counta = this.phase_activities.length - this.countf;
          this.countt = this.phase_activities.length;

          this.percentage = this.countf / this.countt * 100;
          this.loading_phase = false;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading_phase = false;
        }
      });
  }

  // DRAG AND DROP
  onDragStart(event: DragEvent) {
    //
  }

  onDragEnd(event: DragEvent) {
    //
  }

  onDragged(item: any, list: any[], effect: DropEffect) {
    if (effect === "move") {
      const index = list.indexOf(item);
      list.splice(index, 1);
    }
  }

  onDrop(event: DndDropEvent, list?: any[], iteration?: string, phase?: string) {
    if (list && (event.dropEffect === "copy" || event.dropEffect === "move")) {

      let index = event.index;

      if (typeof index === "undefined") {
        index = list.length;
      }

      list.splice(index, 0, event.data);

      const change = this.setChange('Iteración', event.data.iteration || 'Nada', iteration || 'Nada', event.data._id);
      this.activityService.edit({ ...event.data, iteration: iteration, phase: phase, change }, event.data._id)
        .pipe(first())
        .subscribe({
          next: res => {
            // console.log(res);
            this.toastr.success("Actividad modificada", null, { positionClass: 'toast-bottom-center' });
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          }
        });
    }
  }

  goTo(url: any[]) {
    this.router.navigate(url, { relativeTo: this.route });
  }

}
