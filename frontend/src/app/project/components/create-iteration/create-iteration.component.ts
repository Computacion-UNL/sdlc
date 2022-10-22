import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { formatDate } from '@angular/common';
import { Iteration } from '@app/_models/iteration';
import { DateLessThan, noWhiteSpaceValidator } from '@app/_helpers/form.validators';
import { IterationService } from '@app/_services/iteration.service';
import { first } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-iteration',
  templateUrl: './create-iteration.component.html',
  styleUrls: ['./create-iteration.component.scss']
})
export class CreateIterationComponent implements OnInit {
  @Input() iteration: Iteration;
  @Input() project_id: string;

  @Input() objectives: { name: string, done: boolean }[] = [];

  form: FormGroup;

  loading: boolean = false;
  submitted: boolean = false;
  editing: boolean = false;

  now: Date = new Date();

  selected: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private iterationService: IterationService,
    private toastr: ToastrService,
    ) {
      this.now.setFullYear(this.now.getFullYear() - 2);
    }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: [(this.iteration) ? this.iteration.name : '', Validators.required],
      start_date: [(this.iteration) ? formatDate(this.iteration.start_date, 'yyyy-MM-dd', 'en','+0000') : '', Validators.required],
      finish_date: [(this.iteration) ? formatDate(this.iteration.finish_date, 'yyyy-MM-dd', 'en','+0000') : '', Validators.required],
      objective: [(this.iteration) ? this.iteration.objective : '', Validators.required]
    }, { validator: [DateLessThan('start_date', 'finish_date'), noWhiteSpaceValidator('name'), noWhiteSpaceValidator('objective')] });
    this.editing = this.iteration !== null && this.iteration !== undefined;
    this.selected = this.iteration?.objective || '';
  }

  get fp() { return this.form.controls }

  onSubmitIteration() {
    this.submitted = true;
    if (this.form.invalid)
      return;

    this.loading = true;
    const data: Iteration = {
      name: this.fp['name'].value,
      start_date: this.fp['start_date'].value,
      finish_date: this.fp['finish_date'].value,
      objective: this.fp['objective'].value,
      project: this.project_id,
    };

    if (this.editing) {
      //Editar Iteracion
      this.iterationService.edit(data, this.iteration?._id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.toastr.success("La iteración ha sido modificada correctamente.", null, { positionClass: 'toast-bottom-center' });
            this.activeModal.close(true);
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading = false;
          }
        });
    } else {
      //Crear Iteración
      this.iterationService.add(data)
        .pipe(first())
        .subscribe({
          next: res => {
            this.toastr.success("La iteración ha sido creada correctamente.", null, { positionClass: 'toast-bottom-center' });
            this.activeModal.close(true);
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading = false;
          }
        });
    }
  }

  getLimitDate(date: Date): string {
    return formatDate(date,'yyyy-MM-dd', 'en').toString();
  }

  toggleSelection(data: string) {
    if(this.selected === data) {
      this.selected = '';
      this.fp['objective'].setValue('');
    } else {
      this.selected = data;
      this.fp['objective'].setValue(data);
    }
  }
}
