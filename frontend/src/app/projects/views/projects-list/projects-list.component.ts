import { Component, OnInit } from '@angular/core';
import { ProjectService } from "@app/_services/project.service";
import { ToastrService } from 'ngx-toastr';
import { Project } from '@app/_models/project';
import { first } from 'rxjs';
import { Utilities } from '@app/_helpers/Utilities';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@app/_components/modal/modal.component';
import { CreateProjectComponent } from '@app/projects/components/create-project/create-project.component';
import { FormControl, FormGroup } from '@angular/forms';
import { MemberService } from '@app/_services/member.service';
import { AuthenticationService } from '@app/_services/auth.service';
import { User } from '@app/_models/user';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss']
})
export class ProjectsListComponent implements OnInit {
  loading: boolean = false;
  fetched: boolean = false;
  form: FormGroup;
  searching: boolean = false;
  view_teacher_item = false;
  user:User;
  is_manager: boolean;
  options: Project = { status: "En ejecución" };

  config = {
    id: 'projects',
    itemsPerPage: 12,
    currentPage: 1,
  };

  projects: Project[] = [];

  constructor(
    private projectService: ProjectService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private memberService: MemberService,
    private authService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.fetchProjects(this.options);
    this.user = this.authService.currentUserValue;    
    this.form = new FormGroup({
      search: new FormControl()
    });
  }

  setOptions(status: string) {
    this.options.status = status;
    return this.options;
  }

  fetchProjects(options) {
    this.loading = true;
    this.projectService.getAllProjectsByUser(options)
      .pipe(first())
      .subscribe({
        next: res => {
          this.projects = res as Project[];
          this.projects.forEach(project => {
            this.isAuthorized(project);
          });
          this.loading = false;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      })
  }

  getProjectsByStatus(status: boolean) {
    if (status) {
      this.fetchProjects(this.setOptions("En ejecución"));
    } else {
      this.fetchProjects(this.setOptions("Finalizado"));
    }
  }

  createProject() {
    const modalRef = this.modalService.open(CreateProjectComponent, { centered: true, size: 'lg' });
    modalRef.closed.subscribe({
      next: value => {
        if (value) {
          this.fetchProjects(this.options);
        }
      }
    });
  }

  showReason(data: any) {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Motivo del Cierre del Proyecto`,
      message: data.reason
    };
  }

  searchProjects() {
    this.projectService.searchProjects(this.form.controls['search'].value)
      .subscribe((res: any) => {
        this.projects = [];
        res.forEach(element => {
          this.projects.push(element.project);
        });
        this.searching = true;
      });
  }

  clearSearch() {
    this.fetchProjects(this.setOptions("En ejecución"));
    this.form.controls['search'].reset();
    this.searching = false;
  }

  //Determinar si el usuario tiene permiso para acceder a los ajustes del proyecto
  isAuthorized(project) {
    this.memberService.getAll(project._id)
      .pipe(first())
      .subscribe({
        next: res => {
          res.forEach(element => {
            element?.role?.permissions.forEach(el => {
              if (element.role.name === 'Gestor') { 
                this.view_teacher_item = true;
              }
              if (el === 1 && element.user._id === this.user.id) {
                if (element.owner) {
                  project.is_owner = true;
                  project.can_view_settings = true;
                } else {
                  project.can_view_settings = true;
                }
              } else if (el === 9 && element.user._id === this.user.id) {
                project.can_view_settings = true;
              }
            });
          });
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        },
      });
  }

  deleteProject(data: any) {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Cerrar Proyecto`,
      message: `El proyecto será cerrado definitivamente. Recuerde que esta acción es irreversible. ¿Desea Continuar?`,
      withReason: true,
    };

    modalRef.closed.subscribe({
      next: val => {
        if (val) {
          this.toastr.info("Cerrando proyecto...", null, { positionClass: 'toast-bottom-center' });
          const prj: Project = {
            id: data._id,
            active: false,
            status: 'Finalizado',
            reason: 'Cerrado Abrupto. ' + val,
          };

          this.projectService.edit(prj)
            .pipe(first())
            .subscribe({
              next: res => {
                this.toastr.success("El proyecto ha sido finalizado correctamente.", null, { positionClass: 'toast-bottom-center' });
                this.fetchProjects(this.options);
              },
              error: err => {
                this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              }
            });
        }
      }
    });
  }

  getAcronym(input: string) {
    return Utilities.generateAcronym(input);
  }

  removeHTMLTags(input: string) {
    return input?.replace(/(<([^>]+)>)/ig, ' ') || 'Nada';
  }
}
