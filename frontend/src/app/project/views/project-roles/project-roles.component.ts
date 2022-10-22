import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Role } from '@app/_models/role';
import { RoleService } from '@app/_services/role.service';
import { first } from 'rxjs';
import { ModalComponent } from '@app/_components/modal/modal.component';
import { CreateRoleComponent } from '@app/project/components/create-role/create-role.component';
import { ProjectService } from '@app/_services/project.service';
import { Project } from '@app/_models/project';

@Component({
  selector: 'app-project-roles',
  templateUrl: './project-roles.component.html',
  styleUrls: ['./project-roles.component.scss']
})
export class ProjectRolesComponent implements OnInit {
  project_id: string;
  project: Project;

  fetched: boolean = false;
  loading: boolean = false;
  disabled: boolean = false;
  roles: Role[] = [];

  permissions = [
    { name: 'Acceso Total', value: 1 },
    { name: 'Editar Información de Iteración', value: 2 },
    { name: 'Dar de baja Iteración', value: 3 },
    { name: 'Editar información del Proyecto', value: 4 },
    { name: 'Dar de baja Actividad', value: 5 },
    { name: 'Dar de baja Subactividad', value: 6 },
    { name: 'Dar de baja Incidencia', value: 7 },
    { name: 'Acceso a Ajustes del Proyecto', value: 8 },
  ];

  config = {
    id: 'roles',
    itemsPerPage: 10,
    currentPage: 1,
  };


  steps = [
    {
      step: 'roles', title: 'Administrar Roles de los Colaboradores del Proyecto',
      text: `En esta sección se puede administrar los roles de los claboradores del proyecto. 
        Esta funcionalidad es exclusiva del dueño del proyecto.`
    },
    {
      step: 'add-role', title: 'Agregar Roles',
      text: `Puedes agregar nuevos roles personalizados al proyecto. Para ello, presiona el botón y selecciona las funcionalidades
      que deseas asignar al rol.`
    },
    {
      step: 'list-roles', title: 'Listado de Roles',
      text: `Puedes ver los roles generales y personalizados que colaboran en el proyecto.`
    },
    {
      step: 'delete-role', title: 'Dar de baja Rol',
      text: `Puedes dar de baja  un rol presionando el boton y seleccionando 'Dar de baja' y luego confirmar la acción.`
    }
  ];


  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private projectService: ProjectService,
    private roleService: RoleService
  ) { }

  ngOnInit(): void {
    this.project_id = this.route.parent.snapshot.params['project'];
    this.fetchRoles();
    this.fetchProject();
  }

  fetchProject() {
    this.projectService.get(this.project_id).pipe(first()).subscribe({
      next: res => {
        this.project = res;      
        if (!this.project.active) {
          this.disabled = true;
        }
      }
    })
  }

  fetchRoles() {
    if (this.project_id) {
      this.loading = true;
      this.roleService.getAll(this.project_id).pipe(first()).subscribe({
        next: res => {
          this.fetched = true;
          this.loading = false;
          this.roles = res;
          this.roles.forEach(role => {
            role.permission_detail = [];
            this.permissions.forEach(permission => {
              role?.permissions.forEach(role_permission => {
                if (permission.value === role_permission) {
                  role.permission_detail.push({
                    name: permission.name,
                    value: role_permission
                  });
                }
              });
            });
          });
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      })
    }
  }

  //Abrir el modal
  open(data: Role) {
    const modalRef = this.modalService.open(CreateRoleComponent, { centered: true });
    modalRef.componentInstance.role = data;
    modalRef.componentInstance.project_id = this.project_id;

    modalRef.closed.subscribe({
      next: res => {
        if (res) {
          this.fetchRoles();
        }
      },
    })
  }

  deleteRole(data) {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Dar de baja Rol`,
      message: `El rol será dado de baja. Recuerda que esta acción es irreversible. ¿Deseas Continuar?`,
      withReason: false,
    };

    modalRef.closed.subscribe({
      next: val => {
        if (val) {
          this.roleService.remove(data._id).pipe(first()).subscribe({
            next: res => {
              this.toastr.success("El rol ha sido dado de baja satisfactoriamente.", null, { positionClass: 'toast-bottom-center' });
              this.fetchRoles();
            },
            error: err => {
              this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
            }
          });
        }
      }
    });
  }

}
