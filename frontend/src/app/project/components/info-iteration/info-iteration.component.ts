import { Component, Input, OnInit } from '@angular/core';
import { Utilities } from '@app/_helpers/Utilities';
import { Iteration } from '@app/_models/iteration';
import { ActivityService } from '@app/_services/activity.service';
import { IterationService } from '@app/_services/iteration.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-info-iteration',
  templateUrl: './info-iteration.component.html',
  styleUrls: ['./info-iteration.component.scss']
})
export class InfoIterationComponent implements OnInit {

  @Input() id_iteration: string;
  iteration: Iteration
  results = [];
  performed_activities: number;
  discard_activities: number;
  completed_activities: number;
  incompleted_activities: number;
  delayed_activities: number;

  //Opciones para gráficas
  view: [number, number] = [500, 300];
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;

  legend: string = "Actividades";
  showXAxis: boolean = true;

  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private iterationService: IterationService,
    private activityService: ActivityService
  ) { }

  ngOnInit(): void {
    this.fetchIteration();
    this.fetchActivities();
  }

  fetchIteration() {
    this.iterationService.get(this.id_iteration).pipe(first()).subscribe({
      next: res => {
        this.iteration = res;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.activeModal.dismiss();
      }
    });
  }


  fetchActivities() {
    this.activityService.getAll(this.id_iteration).pipe(first()).subscribe({
      next: res => {
        this.performed_activities = res.filter((a) => a.discard === false).length;
        this.discard_activities = res.filter((a) => a.discard === true).length;
        this.completed_activities = res.filter((a) => a.status === "Finalizada" && a.discard === false).length;
        this.incompleted_activities = res.filter((a) => (a.status === "Por Hacer" || a.status === "En Curso") && a.discard === false).length;
        this.delayed_activities = res.filter((a) => this.delayActivity(a.finish_date, a.finish_real_date) > 0).length;

        this.results = [
          { name: "Resueltas", value: this.completed_activities },
          { name: "Sin Resolver", value: this.incompleted_activities },
          { name: "Con Retraso", value: this.delayed_activities },
          { name: "Descartadas", value: this.discard_activities }
        ];
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }

  delayActivity(finish_date_activity, finish_real_date_activity) {
    return Utilities.delayActivity(finish_date_activity, finish_real_date_activity);
  }



}
