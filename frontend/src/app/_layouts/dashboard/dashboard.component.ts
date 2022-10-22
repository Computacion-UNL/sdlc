import { Component, OnDestroy, OnInit } from '@angular/core';
import { TitleService } from '@app/_services/title.service';

import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private _unsubscriber$: Subject<any> = new Subject();
  private screenWidth$: BehaviorSubject<number> = new BehaviorSubject(null);

  mobile: boolean = false;
  opened: boolean = true;

  constructor(
    public titleService: TitleService
  ) {
    this._setMediaBreakpoint(window.innerWidth);
    this.init();
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

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this._unsubscriber$.next(null);
    this._unsubscriber$.complete();
  }

  private _setScreenWidth(width: number): void {
    this.screenWidth$.next(width);
  }

  private _setMediaBreakpoint(width: number): void {
    if(width >= 768) {
      this.mobile = false;
    }else{
      this.mobile = true;
      if(this.opened) {
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
