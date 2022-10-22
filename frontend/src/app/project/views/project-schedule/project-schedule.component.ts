import Gantt from 'frappe-gantt';

import { utils, write, WorkBook } from "xlsx";
import { saveAs } from "file-saver";
import * as svg from 'save-svg-as-png';

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityService } from '@app/_services/activity.service';
import { first, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoActivityComponent } from '@app/project/components/info-activity/info-activity.component';
import { Activity } from '@app/_models/activity';
import { ProjectService } from '@app/_services/project.service';
import { Project } from '@app/_models/project';

@Component({
  selector: 'app-project-schedule',
  templateUrl: './project-schedule.component.html',
  styleUrls: ['./project-schedule.component.scss']
})
export class ProjectScheduleComponent implements OnInit {
  project_id: string;
  project: Project;

  gantt: any;
  loading: boolean = true;
  loading_export: boolean = false;

  tasks: {
    id: string,
    name: string,
    start: string,
    end: string,
    progress: number,
    dependencies?: string,
    custom_class?: string,
  }[] = [];
  activities: Activity[] = [];
  activeMode: string = 'Day';

  steps = [
    {
      step: 'schedule', title: 'Cronograma',
      text: `En esta sección se puede visualizar todas las actividades del proyecto a modo de cronograma, donde se pueden manipular
      los elementos y se actualizarán automáticamente las fechas de finalización. Para visualizar esta sección es necesario iniciar una
      iteración.`
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private activityService: ActivityService,
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.project_id = this.route.parent.snapshot.params['project'];
    this.fetchProject();
  }

  fetchProject() {
    if(this.project_id) {
      this.projectService.get(this.project_id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.project = res;
            if(this.project.iteration) {
              this.fetchActivities(this.activityService.getAllActive(this.project_id));
            }else {
              this.fetchActivities(this.activityService.getAllByProject(this.project_id));
            }
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          }
        });
    }
  }

  fetchActivities(fn: Observable<Activity[]>) {
    if (this.project_id) {
      fn
        .pipe(first())
        .subscribe({
          next: res => {
            if (res && res.length > 0) {
              this.activities = res;
              this.tasks = res.map(x => {
                let refs = res.filter(y => x?.parent === y._id).map(y => y._id).toString();
                var custom_class = '';

                if (x.parent){                  
                  custom_class = x.incidence ? 'bg_incidence' : 'bg_subactivity';
                }else {
                  custom_class = this.getPhaseClass(x.phase);
                }
                let start = new Date(x.start_date), end = new Date(x.finish_date);
                return {
                  id: x._id,
                  name: x.name,
                  start: start > end ? this.formatDate(x.finish_date) : this.formatDate(x.start_date),
                  end: this.formatDate(x.finish_date),
                  progress: 100,
                  iteration: x.iteration,
                  dependencies: refs,
                  custom_class: custom_class,
                }
              });
              this.loading = false;
              this.initGantt();
            } else {
              this.loading = false;
            }
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          },
        });
    }
  }

  initGantt() {
    if (this.tasks.length > 0) {
      this.gantt = new Gantt('#gantt', this.tasks, {
        language: 'es',
        on_click: (task: any): void => {
          const modalRef = this.modalService.open(InfoActivityComponent, { centered: true });
          modalRef.componentInstance.activity = task;
          modalRef.componentInstance.project_id = this.project_id;
        },
        on_date_change: (task: any, start: Date, end: Date): void => {
          if(this.project?.iteration) {
            this.toastr.error('No se pueden modificar las fechas de una iteración activa, los cambios no se aplicarán.', null, { positionClass: 'toast-bottom-center' });
          }else {            
            let new_s = new Date(start.getFullYear()+'-'+(start.getMonth()+1)+'-'+start.getDate());
            let new_f = new Date(end.getFullYear()+'-'+(end.getMonth()+1)+'-'+end.getDate());
            let ite_s = new Date(this.formatDate(task.iteration?.start_date));
            let ite_f = new Date(this.formatDate(task.iteration?.finish_date));
            
            if((new_s >= ite_s && new_s <= ite_f) && (new_f >= ite_s && new_f <= ite_f)){
              var change = this.setChange('Fecha de inicio', task.start || 'Ninguno', this.formatDate(start) || 'Ninguno', task.id);
              if (task.start == this.formatDate(start)) {
                change = this.setChange('Fecha de finalización', task.end || 'Ninguno', this.formatDate(end) || 'Ninguno', task.id);
              }
    
              this.activityService.edit({ start_date: start, finish_date: end, change }, task.id)
                .pipe(first())
                .subscribe({
                  next: res => {
                    console.log('¡Done!');
                  },
                  error: err => {
                    this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
                  },
                });
            } else{
              this.toastr.error('Fechas fuera del límite establecido por la iteración', null, { positionClass: 'toast-bottom-center' });
            }
          }
        },
      });
    }
  }

  changeView(mode: string = 'Day') {
    if (this.gantt) {
      this.activeMode = mode;
      this.gantt.change_view_mode(mode); // Quarter Day, Half Day, Day, Week, Month
    }
  }

  private formatDate(date: any) {
    var d = new Date(date),
      month = '' + (d.getUTCMonth() + 1),
      day = '' + d.getUTCDate(),
      year = d.getUTCFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  private setChange(attribute: string, previous_value: any, new_value: any, id: string) {
    return {
      attribute_type: attribute,
      previous_value: previous_value,
      new_value: new_value,
      activity: id
    }
  }

  exportToXLSX() {
    if(this.activities?.length > 0) {
      this.toastr.info('Generando archivo...', null, { positionClass: 'toast-bottom-center' });
      this.loading_export = true;
      let json = this.activities.map(x => {
        let responsible = x.responsable.map(x => x.name+' '+x.lastname);
        return {
          'Nombre': x.name,
          'Descripción': this.removeHTMLTags(x.description),
          'Fecha de inicio': this.formatDate(x.start_date),
          'Fecha de finalización': this.formatDate(x.finish_date),
          'Iteración': x.iteration?.name,
          'Prioridad': x.priority,
          'Responsables': responsible.join(', ') || '(Sin asignar)',
          'Estado': x.status
        }
      });

      const ws_name = 'Actividades';
      const wb: WorkBook = { SheetNames: [], Sheets: {} };
      const ws: any = utils.json_to_sheet(json);
      wb.SheetNames.push(ws_name);
      wb.Sheets[ws_name] = ws;
      const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

      function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
          view[i] = s.charCodeAt(i) & 0xFF;
        };
        return buf;
      }

      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'exportado_'+this.formatDate(Date.now()).replace(/-/g,'')+'.xlsx');
      this.loading_export = false;
    }else {
      this.toastr.error('No hay actividades para exportar', null, { positionClass: 'toast-bottom-center' });
    }
  }

  exportToPNG() {
    this.toastr.info('Generando archivo...', null, { positionClass: 'toast-bottom-center' });
    svg.svgAsPngUri(document.getElementById('gantt'), {}, (uri) => {
      saveAs(uri, 'exportado_'+this.formatDate(Date.now()).replace(/-/g,'')+'.png');
    });
  }

  removeHTMLTags(input: string) {
    return input?.replace(/(<([^>]+)>)/ig, ' ') || 'Nada';
  }

  getPhaseClass(phase: string): string {
    switch (phase) {
      case 'planning':
        return 'bg-planning';
      case 'design':
        return 'bg-design';
      case 'coding':
        return 'bg-coding';
      case 'testing':
        return 'bg-testing';
      default:
        return '';
    }
  }

}
