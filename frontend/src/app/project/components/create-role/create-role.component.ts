import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { minSelectedCheckboxes } from '@app/_helpers/form.validators';
import { Role } from '@app/_models/role';
import { RoleService } from '@app/_services/role.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss']
})
export class CreateRoleComponent implements OnInit {
  @Input() project_id: string;
  @Input() role: Role;

  loading: boolean = false;
  submitted: boolean = false; 
  editing: boolean = false; 
  
  permissions: { name: string, value: number }[] = [
    // { name: 'Acceso Total', value: 1 },
    { name: 'Editar Información de Iteración', value: 2 },
    { name: 'Dar de baja Iteración', value: 3 },
    { name: 'Iniciar Iteración', value: 4 },
    // { name: 'Asignar Calificación a Iteración', value: 5 },
    { name: 'Dar de baja Actividad', value: 6 },
    { name: 'Dar de baja Subactividad', value: 7 },
    { name: 'Dar de baja Incidencia', value: 8 },
    { name: 'Acceso a Ajustes del Proyecto', value: 9 },
  ];

  form: FormGroup;  

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private roleService: RoleService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: [this.role?.name, Validators.required],
      permissions: new FormArray([], minSelectedCheckboxes(1))
    });

    this.editing = this.role !== null && this.role !== undefined;
    this.addCheckBoxes();
  }

 


  get fr() { return this.form.controls }

  get permissionsFormArray() {
    return this.form.controls['permissions'] as FormArray;
  }

  private addCheckBoxes() {
    if(!this.editing) {
      this.permissions.forEach(() => this.permissionsFormArray.push(new FormControl(false)));
    }else{           
      this.permissions.forEach(permission => {
        let found = this.role.permission_detail.find(x => x.value === permission.value);
        this.permissionsFormArray.push(new FormControl(found !== undefined));
      });
    }
  }

  onSubmitRole() {
    if(this.project_id) {
      this.submitted = true;
      if (this.form.invalid)
        return;
  
      this.loading = true;
  
      const selectedPermissions = this.form.value.permissions
        .map((checked: any, i: string | number) => checked ? this.permissions[i].value : null)
        .filter((v: any) => v !== null);
  
      const data: Role = {
        name: this.fr['name'].value,
        permissions: selectedPermissions,
        project: this.project_id,
      };
  
      if (this.role) {
        //Editar rol
        this.roleService.edit(data, this.role._id)
          .pipe(first())
          .subscribe({
            next: res => {
              this.toastr.success("El rol ha sido modificado correctamente.", null, { positionClass: 'toast-bottom-center' });
              this.activeModal.close(true);
            },
            error: err => {
              this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              this.loading = false;
            }
          });
      } else {
        //Crear Rol
        this.roleService.add(data)
          .pipe(first())
          .subscribe({
            next: res => {
              this.toastr.success("El rol ha sido creado correctamente.", null, { positionClass: 'toast-bottom-center' });
              this.activeModal.close(true);
            },
            error: err => {
              this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              this.loading = false;
            }
          });
      }
    }else {
      this.toastr.error("¡Proyecto no reconocido!", null, { positionClass: 'toast-bottom-center' });
    }
  }

}
