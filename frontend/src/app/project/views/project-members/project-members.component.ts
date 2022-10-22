import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalComponent } from '@app/_components/modal/modal.component';
import { Member } from '@app/_models/member';
import { Project } from '@app/_models/project';
import { MemberService } from '@app/_services/member.service';
import { ProjectService } from '@app/_services/project.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-project-members',
  templateUrl: './project-members.component.html',
  styleUrls: ['./project-members.component.scss']
})
export class ProjectMembersComponent implements OnInit {
  loading: boolean = false;
  fetched: boolean = false;

  project_id: string;
  project: Project;
  disabled: boolean = false;
  members: Member[] = [];

  config = {
    id: 'collaborators',
    itemsPerPage: 10,
    currentPage: 1,
  };

  steps = [
    {
      step: 'members', title: 'Administrar Colaboradores',
      text: `En esta sección se puede administrar los colaboradores del proyecto. Esta funcionalidad es exclusiva del dueño del proyecto.`
    },
    {
      step: 'add-member', title: 'Agregar Colaboradores al Proyecto',
      text: `Puedes agregar nuevos colaboradores al proyecto. Para ello, presiona el botón y selecciona los usuarios que 
      deseas invitar al proyecto. Cuando se acepte la invitación por parte del usuario será parte del proyecto.`
    },
    {
      step: 'list-members', title: 'Listado de Colaboradores del Proyecto',
      text: `Puedes ver los usuarios que colaboran en el proyecto.`
    },
    {
      step: 'delete-member', title: 'Dar de baja colaborador',
      text: `Puedes dar de baja a un colaborador presionando el boton de opciones y seleccionando 'Dar de baja' y luego confirmar la acción.`
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private memberService: MemberService,
    private projectService: ProjectService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.project_id = this.route.parent.snapshot.params['project'];
    this.fetchMembers();
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

  fetchMembers() {
    if (this.project_id) {
      this.loading = true;
      this.memberService.getAll(this.project_id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.loading = false;
            this.fetched = true;

            this.members = res;
          },
          error: err => {
            this.loading = false;
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          },
        })
    }
  }

  deleteMember(data: any) {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: 'Dar de baja colaborador',
      message: 'El colaborador será dado de baja. Está acción es irreversible, ¿deseas continuar?',
      withReason: true,
    };

    modalRef.closed.subscribe({
      next: val => {
        if(val) {
          const mmbr: Member = {
            id: data._id,
            removed: true,
            reason: val,
          };
          this.memberService.edit(mmbr)
            .pipe(first())
            .subscribe({
              next: res => {
                this.toastr.success("El colaborador ha sido dado de baja.", null, { positionClass: 'toast-bottom-center' });
                this.fetchMembers();
              },
              error: err => {
                this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              }
            })
        }
      }
    })
  }

}
