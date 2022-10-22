import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input() data: { title: string, message: string, withReason?: boolean, placeholder?: string, denyOption?: boolean };
  value: string;

  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void { }

  acept() {
    if (this.data.placeholder) {
      let number = new RegExp("^([1-9])?([0])?$");
      let decimal = new RegExp("^([0-9])?[.]([0-9])([0-9])?$");
      if (!(number.test(this.value) || decimal.test(this.value))) {
        this.toastr.error('Se debe ingresar el dato correctamente', null, { positionClass: 'toast-bottom-center' });
        return;
      }
    } else if (this.data.withReason && !this.value?.trim()) {
      this.toastr.error('Debes ingresar los datos requeridos', null, { positionClass: 'toast-bottom-center' });
      return;
    }
    this.activeModal.close(this.value || true);
  }

  deny() {
    this.activeModal.close(false);
  }
}
