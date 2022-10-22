import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';
import { saveAs } from "file-saver";

import { ReportService } from '@app/_services/report.service';
import { Project } from '@app/_models/project';

@Component({
  selector: 'app-project-reports',
  templateUrl: './project-reports.component.html',
  styleUrls: ['./project-reports.component.scss']
})
export class ProjectReportsComponent implements OnInit {

  project_id: string;
  project: Project = {};
  activities_total: any[] = [];
  showStadistics: boolean;

  //Opciones para gráficas
  view: [number, number] = [500, 300];
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;

  legend: string = "Actividades";
  showXAxis: boolean = true;

  loading_generate: boolean = false;

  // Descripción Tour
  steps = [
    {
      step: 'reports', title: 'Vista de Reportes',
      text: `En esta sección se puede visualizar un resumen del proyecto. Se incluyen los colaboradores y un resumen de las 
        iteraciones y las actividades del proyecto.`
    },
    {
      step: 'members', title: 'Listado de los colaboradores del proyecto',
      text: `Se presenta un resumen de todos los miembros del proyecto incluido el rol que desempeña cada uno`
    },
    {
      step: 'activities', title: 'Gráfica de Resumen de Actividades',
      text: `Se presenta una gráfica de pastel estadística clasificada por el estado de las actividades. No se presentará
      la gráfica en caso de no existir actividades activas dentro del proyecto`
    },
    {
      step: 'iterations', title: 'Resumen de Iteraciones y Actividades Independientes',
      text: `Se presenta un resumen detallado de cada una de las iteraciones que se tiene dentro del proyecto así como de las actividades
      independientes que aún no se encuentran anexadas a ninguna iteración`
    },
    {
      step: 'file', title: 'Generar Archivo PDF del Reporte',
      text: `Al presionar el botón puedes generar un archivo PDF con toda la información del proyecto. Se incluyen iteraciones, actividades y 
      sus responsables.`
    }
  ];

  constructor(
    private reportService: ReportService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit(): void {
    this.project_id = this.route.parent.snapshot.params['project'];
    this.fetchReportInformation();
  }

  fetchReportInformation() {
    this.reportService.getInformation(this.project_id).pipe(first()).subscribe({
      next: result => {
        this.project = result[0] as Project;
        this.activities_total = this.getNumberOfActivities(this.project);
        if (this.project?.iterations) {
          this.project.iterations.sort((a, b) => this.getTime(a.start_date) - this.getTime(b.start_date));
          for (let iteration of this.project.iterations) {
            iteration.activities.sort((a, b) => this.getTime(a.finish_date) - this.getTime(b.finish_date));
          }
        }
        this.showStadistics = (this.project.iterations.length > 0 || this.project.activities_only.length > 0) ? true : false;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }

  private getNumberOfActivities(project) {
    let activities = { pending_total: 0, developing_total: 0, finished_total: 0, pending: 0, developing: 0, finished: 0 }
    project.iterations.forEach(iteration => {
      if (iteration.activities.length > 0) {
        iteration.activities.forEach(activity => {
          switch (activity.status) {
            case "Por Hacer":
              activities.pending_total++;
              activities.pending++;
              break;
            case "En Curso":
              activities.developing_total++;
              activities.developing++;
              break;
            case "Finalizada":
              activities.finished_total++;
              activities.finished++;
              break;
          }
        });
      }
      iteration.activities_numbers = [
        { name: "Por Hacer", value: activities.pending },
        { name: "En Curso", value: activities.developing },
        { name: "Finalizadas", value: activities.finished }
      ];
      activities.pending = 0;
      activities.developing = 0;
      activities.finished = 0;
    });

    if (project.activities_only.length > 0) {
      project.activities_only.forEach(activity => {
        switch (activity.status) {
          case "Por Hacer":
            activities.pending_total++;
            activities.pending++;
            break;
          case "En Curso":
            activities.developing_total++;
            activities.developing++;
            break;
          case "Finalizada":
            activities.finished_total++;
            activities.finished++;
            break;
        }
      });
      project.activities_numbers = [
        { name: "Por Hacer", value: activities.pending },
        { name: "En Curso", value: activities.developing },
        { name: "Finalizadas", value: activities.finished }
      ];
    }

    let result = [
      { "name": "Por Hacer", "value": activities.pending_total },
      { "name": "En Curso", "value": activities.developing_total },
      { "name": "Finalizadas", "value": activities.finished_total }
    ];
    return result;
  }

  generateReport() {
    this.loading_generate = true;
    this.reportService.generateReport(this.project_id).pipe(first()).subscribe({
      next: result => {
        let blob = new Blob([result], { type: 'application/pdf' });
        let url = window.URL.createObjectURL(blob);
        let ext = result.type.split('/')[1];
        //window.open(url);
        saveAs(url,'reporte_'+Date.now()+'.'+ext);
        this.toastr.success("Se ha generado el reporte correctamente", null, { positionClass: 'toast-bottom-center' });
        this.loading_generate = false;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.loading_generate = false;
      }
    });
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

  private getTime(date?: Date) {
    return date != null ? new Date(date).getTime() : 0;
  }

}
