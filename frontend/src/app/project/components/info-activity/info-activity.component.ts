import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-info-activity',
  templateUrl: './info-activity.component.html',
  styleUrls: ['./info-activity.component.scss']
})
export class InfoActivityComponent implements OnInit {
  @Input() activity: any;
  @Input() project_id: string;

  phases: { pos: number, code: string, name: string }[] = [
    { pos: 1, code: 'planning', name: 'Análisis' },
    { pos: 2, code: 'design', name: 'Diseño' },
    { pos: 3, code: 'coding', name: 'Codificación' },
    { pos: 4, code: 'testing', name: 'Pruebas' },
  ];

  phase: string = 'Ninguna';

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    if(this.activity?.iteration?.phase) {
      this.phase = this.phases[this.activity?.iteration?.phase]?.name;
    }
  }

}
