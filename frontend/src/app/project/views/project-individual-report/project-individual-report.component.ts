import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utilities } from '@app/_helpers/Utilities';
import { Iteration } from '@app/_models/iteration';
import { ActivityService } from '@app/_services/activity.service';
import { IterationService } from '@app/_services/iteration.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';
import { utils, write, WorkBook } from "xlsx";
import { saveAs } from "file-saver";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoIterationComponent } from '@app/project/components/info-iteration/info-iteration.component';
import { ReportService } from '@app/_services/report.service';

@Component({
  selector: 'app-project-individual-report',
  templateUrl: './project-individual-report.component.html',
  styleUrls: ['./project-individual-report.component.scss']
})
export class ProjectIndividualReportComponent implements OnInit {

  iteration_id: string;
  iteration: Iteration;
  performed_activities = [];
  discard_activities = [];
  all_activities = [];
  completed_activities: number;
  incompleted_activities: number;
  delayed_activities: number;
  loading_export: boolean = false;
  loading_generate: boolean;

  // Descripción Tour
  steps = [
    {
      step: 'export-report', title: 'Exportar Reporte',
      text: `Al pulsar el botón se podrá descargar el resumen de la iteración en formato PDF o Excel(XLSX)`
    },
    {
      step: 'activities-general', title: 'Actividades Desarrolladas',
      text: `La tabla contiene las actividades planificadas en la iteración, se muestra su estado y si contiene días de retraso.`
    },
    {
      step: 'activities-summary', title: 'Resumen de Actividades',
      text: `La tabla contiene el resumen de las actividades en caso de haber sido completadas sin novedad, con retraso, descartadas durante 
      el desarrollo de la iteración o si están sin resolver para ser considerada en la siguiente iteración.`
    },
    {
      step: 'activities-discard', title: 'Actividades Descartadas',
      text: `La tabla contiene las actividades que han sido descartadas durante el desarrollo de la iteración.`
    },
    {
      step: 'activities-graphic', title: 'Resumen Estadístico de la Iteración',
      text: `Al pulsar el botón se muestra una ventana modal con un gráfico de barras que resume el estado de las actividades consideradas dentro
      de la iteración.`
    }

  ];

  constructor(
    private routeActive: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private iterationService: IterationService,
    private activityService: ActivityService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.iteration_id = this.routeActive.snapshot.params['id'];
    this.fetchIteration();
    this.fetchActivities();
  }

  fetchIteration() {
    this.iterationService.get(this.iteration_id).pipe(first()).subscribe({
      next: res => {
        this.iteration = res;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }

  fetchActivities() {
    this.activityService.getAll(this.iteration_id).pipe(first()).subscribe({
      next: res => {
        this.all_activities = res;
        this.performed_activities = res.filter((a) => a.discard === false);
        this.discard_activities = res.filter((a) => a.discard === true);
        this.completed_activities = res.filter((a) => a.status === "Finalizada" && a.discard === false).length;
        this.incompleted_activities = res.filter((a) => (a.status === "Por Hacer" || a.status === "En Curso") && a.discard === false).length;
        this.delayed_activities = res.filter((a) => this.delayActivity(a.finish_date, a.finish_real_date) > 0).length;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }

  delayActivity(finish_date_activity, finish_real_date_activity) {
    return Utilities.delayActivity(finish_date_activity, finish_real_date_activity);
  }

  viewDiscardedActivity(id_activity: string) {
    this.router.navigate(['/manager/project/', this.iteration.project, 'activity', id_activity]);
  }

  exportToPDF() {
    this.loading_generate = true;
    this.reportService.generateIterationReport(this.iteration._id).pipe(first()).subscribe({
      next: result => {
        let blob = new Blob([result], { type: 'application/pdf' });
        let url = window.URL.createObjectURL(blob);
        let ext = result.type.split('/')[1];
        saveAs(url, 'reporte_' + Date.now() + '.' + ext);
        this.toastr.success("Se ha generado el reporte correctamente", null, { positionClass: 'toast-bottom-center' });
        this.loading_generate = false;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.loading_generate = false;
      }
    });

  }

  exportToXLSX() {
    this.toastr.info('Generando archivo...', null, { positionClass: 'toast-bottom-center' });
    this.loading_export = true;
    let json = this.all_activities.map(x => {
      let responsible = x.responsable.map(x => x.name + ' ' + x.lastname);
      return {
        'Nombre': x.name,
        'Descripción': this.removeHTMLTags(x.description),
        'Fecha de inicio': this.formatDate(x.start_date),
        'Fecha de finalización': this.formatDate(x.finish_date),
        'Prioridad': x.priority,
        'Responsables': responsible.join(', ') || '(Sin asignar)',
        'Estado': x.status,
        'Descartado': (x.discard) ? "Descartada" : "No Descartada",
        'Retraso': (this.delayActivity(x.finish_date, x.finish_real_date) > 0) ? "Retrasada" : "Sin Retraso"
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

    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'exportado_' + this.formatDate(Date.now()).replace(/-/g, '') + '.xlsx');
    this.loading_export = false;
  }

  removeHTMLTags(input: string) {
    return input?.replace(/(<([^>]+)>)/ig, ' ') || 'Nada';
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

  viewIterationGraphics() {
    const modalRef = this.modalService.open(InfoIterationComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.id_iteration = this.iteration_id;
  }

  nextIteration() {
    this.router.navigate(['/manager/project/', this.iteration.project, 'planning']);
  }
}
