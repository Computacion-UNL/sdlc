import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-init-iteration',
  templateUrl: './init-iteration.component.html',
  styleUrls: ['./init-iteration.component.scss']
})
export class InitIterationComponent implements OnInit {
  @Input() msg: string;
  @Input() init: boolean;
  value: string;

  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void { }

  accept() {
    this.activeModal.close(true);
  }

}
