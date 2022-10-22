import { Component, Input, OnInit } from '@angular/core';
import { Activity } from '@app/_models/activity';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-iterations',
  templateUrl: './modal-iterations.component.html',
  styleUrls: ['./modal-iterations.component.scss']
})
export class ModalIterationsComponent implements OnInit {
  @Input() name: string;
  @Input() activities: Activity[] = [];

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
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

}
