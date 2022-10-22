import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { ProjectService } from '@app/_services/project.service';
import { Project } from '@app/_models/project';
import { first } from 'rxjs';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent implements OnInit {
  @Output() refresh = new EventEmitter();

  loading: boolean = false;
  submitted: boolean = false;
  specific: { name: string, done: boolean }[] = [];
  spefific_ob: string = '';

  form: FormGroup;

  editorConfig: AngularEditorConfig = {
    editable: true,
    height: '150px',
    maxHeight: '150px',
    toolbarHiddenButtons: [[],['insertVideo','insertImage']],
    outline: false,
  };
  
  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      general_objective: [''],
    });
  }

  get fp() { return this.form.controls }

  onSubmitProject() {
    this.submitted = true;

    if(this.form.invalid)
      return;
    
    this.loading = true;

    const data: Project = {
      name: this.fp['name'].value,
      description: this.fp['description'].value,
      general_objective: this.fp['general_objective'].value,
      specific_objectives: this.specific,
    };

    this.projectService.add(data)
      .pipe(first())
      .subscribe({
        next: res => {
          this.toastr.success("El proyecto ha sido creado correctamente.", null, { positionClass: 'toast-bottom-center' });
          this.activeModal.close(true);
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = true;
        }
      });
  }

  addObjective() {
    if(this.spefific_ob) {
      this.specific.push({ name: this.spefific_ob, done: false });
      this.spefific_ob = '';
    }
  }

  removeObjective(index: number) {
    this.specific.splice(index, 1);
  }

}
