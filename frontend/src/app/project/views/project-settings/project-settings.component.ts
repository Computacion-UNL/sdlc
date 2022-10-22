import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Utilities } from '@app/_helpers/Utilities';
import { Project } from '@app/_models/project';
import { ProjectService } from '@app/_services/project.service';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@app/_components/modal/modal.component';
import { first } from 'rxjs';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-project-settings',
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.scss']
})
export class ProjectSettingsComponent implements OnInit {
  project_id: string;
  project: Project;

  img_url: string;

  loading: boolean = false;
  loading_upload: boolean = false;
  loading_remove: boolean = false;
  submitted: boolean = false;
  disabled: boolean = false;
  form: FormGroup;

  editorConfig: AngularEditorConfig = {
    editable: true,
    height: '150px',
    maxHeight: '150px',
    toolbarHiddenButtons: [[],['insertVideo','insertImage']],
    outline: false,
  };

  specific: { name: string, done: boolean }[] = [];
  spefific_ob: string = '';

  steps = [
    {
      step: 'settings', title: 'Ajustes del Proyecto',
      text: `En esta sección se puede modificar la información general del proyecto.`
    },
    // {
    //   step: 'edit-image', title: 'Editar imagen del Proyecto',
    //   text: `Es posible agregar una imagen representativa para el proyecto.`
    // },
    {
      step: 'edit-data', title: 'Editar datos del Proyecto',
      text: `Puedes editar la información del proyecto y adjuntar un enlace para el repositorio del proyecto.`
    },
    {
      step: 'close-project', title: 'Cierre del Proyecto Normal',
      text: `Los proyectos se pueden cerrar de manera normal o de manera abrupta(por situaciones externas). Puedes cerrar de manera
      normal presionando el botón y aceptando la ventana de confirmación.`
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.project_id = this.route.parent.snapshot.params['project'];
    let urlRegex = /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?%#[\]@!\$&'\(\)\*\+,;=.]+$/;
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      repository: ['', Validators.pattern(urlRegex)],
      general_objective: [''],
    });

    this.fetchProject();
  }

  fetchProject() {
    if (this.project_id) {
      this.loading = true;
      this.projectService.get(this.project_id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.loading = false;
            this.submitted = false;
            this.project = res;

            if (!this.project.active) {
              this.disabled = true;
            }

            if (this.project.image) {
              this.img_url = `${environment.apiURL.public}${this.project.image}`;
            }

            this.fp['name'].setValue(this.project?.name);
            this.fp['description'].setValue(this.project?.description);
            this.fp['repository'].setValue(this.project?.repository);
            this.fp['general_objective'].setValue(this.project?.general_objective);
            this.specific = this.project?.specific_objectives;
          },
          error: err => {
            this.loading = false;
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          },
        })
    }
  }

  get fp() { return this.form.controls }

  onSubmitProject() {
    if (this.project_id) {
      this.submitted = true;

      if (this.form.invalid)
        return;

      this.loading = true;

      const data: Project = {
        id: this.project_id,
        name: this.fp['name'].value,
        description: this.fp['description'].value,
        repository: this.fp['repository'].value,
        general_objective: this.fp['general_objective'].value,
        specific_objectives: this.specific,
      };

      this.projectService.edit(data)
        .pipe(first())
        .subscribe({
          next: res => {
            this.toastr.success("El proyecto ha sido editado correctamente.", null, { positionClass: 'toast-bottom-center' });
            this.updateData(data);
            this.loading = false;
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading = false;
          }
        });
    }
  }

  finishProject() {
    console.log(this.project);
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Finalizar Proyecto`,
      message: `Felicidades, has llegado al final del proyecto. 
        Una vez finalizado el proyecto ya no se podrá editar.¿Desea Continuar?`,
    };

    modalRef.closed.subscribe({
      next: val => {
        if (val) {
          this.loading = true;
          const prj: Project = {
            id: this.project._id,
            active: false,
            status: 'Finalizado',
            reason: "Cerrado Exitoso. Finalización del Proyecto Correcta",
          };

          this.projectService.edit(prj)
            .pipe(first())
            .subscribe({
              next: res => {
                this.router.navigate(['/manager/projects']);
                this.toastr.success("El proyecto ha sido finalizado correctamente.", null, { positionClass: 'toast-bottom-center' });
              },
              error: err => {
                this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              }
            });
        }
      }
    });
  }

  uploadImage(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.loading_upload = true;
      this.projectService.uploadImage(this.project_id, file)
        .pipe(first())
        .subscribe({
          next: res => {
            this.toastr.success('Se actualizó la imagen correctamente', null, { positionClass: 'toast-bottom-center' });
            this.project = res;
            this.img_url = `${environment.apiURL.public}${this.project.image}`;
            this.loading_upload = false;
          },
          error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            this.loading_upload = false;
          },
        })
    }
  }

  deleteImage() {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Dar de baja Imagen`,
      message: `¿Está seguro que desea dar de baja la imagen del proyecto?`,
    };

    modalRef.closed.subscribe({
      next: val => {
        if (val) {
          this.loading_remove = true;
          this.projectService.deleteImage(this.project_id)
            .subscribe({
              next: (res: any) => {
                this.toastr.success(res.msg, null, { positionClass: 'toast-bottom-center' });
                this.project.image = null;
                this.img_url = `${environment.apiURL.public}${this.project.image}`;
                this.loading_remove = false;
              },
              error: err => {
                this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
                this.loading_remove = false;
              }
            });
        }
      }
    });
  }

  updateData(data: Project) {
    this.project.name = data.name,
      this.project.description = data.description;
    this.projectService.name = data.name;
  }

  getAcronym(input: string) {
    return Utilities.generateAcronym(input);
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
