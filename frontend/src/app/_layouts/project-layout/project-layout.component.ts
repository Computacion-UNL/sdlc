import { Component, OnDestroy, OnInit } from '@angular/core';
import { TitleService } from '@app/_services/title.service';
import { JoyrideService } from 'ngx-joyride';
import { BehaviorSubject, debounceTime, fromEvent, Subject, Subscription, takeUntil } from 'rxjs';
import { DataService } from '@app/_services/data.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-project-layout',
  templateUrl: './project-layout.component.html',
  styleUrls: ['./project-layout.component.scss']
})
export class ProjectLayoutComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  dataPassed: any;

  private _unsubscriber$: Subject<any> = new Subject();
  private screenWidth$: BehaviorSubject<number> = new BehaviorSubject(null);

  mobile: boolean = false;
  opened: boolean = true;

  constructor(
    public titleService: TitleService,
    private joyrideService: JoyrideService,
    private dataService: DataService,
    private router: Router
  ) {
    this.subscription = this.dataService.getData().subscribe(x => {
      this.dataPassed = x;
    });

    this._setMediaBreakpoint(window.innerWidth);
    this.init();
  }

  ngOnInit(): void {
  }

  startTour() {
    switch (this.titleService.title) {
      case 'Planificación':
        this.joyrideService.startTour(
          {
            steps: [
              'create-iteration',
              'backlog',
              'activity-create'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      case 'Proceso':
        this.joyrideService.startTour(
          {
            steps: [
              'view-schedule',
              'activities-list',
              'activity-reserve',
              'end-iteration'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      case 'Reporte de Iteración':
        this.joyrideService.startTour(
          {
            steps: [
              'export-report',
              'activities-general',
              'activities-summary',
              'activities-discard',
              'activities-graphic'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      case 'Cronograma':
        this.joyrideService.startTour(
          {
            steps: [
              'schedule'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      case 'Reportes':
        this.joyrideService.startTour(
          {
            steps: [
              'reports',
              'members',
              'activities',
              'iterations',
              'file'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      case 'Ajustes':
        this.joyrideService.startTour(
          {
            steps: [
              'settings',
              'edit-image',
              'edit-data',
              'close-project'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      case 'Colaboradores':
        this.joyrideService.startTour(
          {
            steps: [
              'members',
              'add-member',
              'list-members',
              'delete-member'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      case 'Roles':
        this.joyrideService.startTour(
          {
            steps: [
              'roles',
              'add-role',
              'list-roles',
              'delete-role'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      case 'Actividad':
        this.joyrideService.startTour(
          {
            steps: [
              'activities',
              'description',
              'status',
              'priority',
              'responsables',
              'dates',
              'create-subactivities',
              'create-incidences',
              'external-link',
              'attached-file',
              'commentaries',
              'history',
              'delete'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      case 'Subactividad':
        this.joyrideService.startTour(
          {
            steps: [
              'subactivities',
              'description',
              'status',
              'priority',
              'responsables',
              'dates',
              'create-tasks',
              'external-link',
              'attached-file',
              'commentaries',
              'history',
              'delete'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      case 'Incidencia':
        this.joyrideService.startTour(
          {
            steps: [
              'incidences',
              'description',
              'status',
              'priority',
              'responsables',
              'dates',
              'create-tasks',
              'external-link',
              'attached-file',
              'commentaries',
              'history',
              'delete'
            ],
            customTexts: {
              next: 'Siguiente',
              prev: 'Anterior',
              done: 'Finalizar'
            },
            themeColor: '#3e4685'
          }
        );
        break;
      default:
        break;
    }

  }

  init() {
    this._setScreenWidth(window.innerWidth);
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(200),
        takeUntil(this._unsubscriber$)
      ).subscribe((evt: any) => {
        this._setScreenWidth(evt.target.innerWidth);
        this._setMediaBreakpoint(evt.target.innerWidth);
      });
  }

  ngOnDestroy() {
    this._unsubscriber$.next(null);
    this._unsubscriber$.complete();
  }

  private _setScreenWidth(width: number): void {
    this.screenWidth$.next(width);
  }

  private _setMediaBreakpoint(width: number): void {
    if (width >= 768) {
      this.mobile = false;
    } else {
      this.mobile = true;
      if (this.opened) {
        this.opened = false;
      }
    }
  }

  closeMenu() {
    this.opened = false;
  }

  openMenu() {
    this.opened = true;
  }
}
