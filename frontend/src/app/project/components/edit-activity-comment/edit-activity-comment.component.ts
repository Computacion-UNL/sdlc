import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from '@app/_components/modal/modal.component';
import { Utilities } from '@app/_helpers/Utilities';
import { Commentary } from '@app/_models/commentary';
import { User } from '@app/_models/user';
import { AuthenticationService } from '@app/_services/auth.service';
import { CommentaryService } from '@app/_services/commentary.service';
import { environment } from '@environments/environment';
import { AngularEditorComponent, AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';

@Component({
  selector: 'app-edit-activity-comment',
  templateUrl: './edit-activity-comment.component.html',
  styleUrls: ['./edit-activity-comment.component.scss']
})
export class EditActivityCommentComponent implements OnInit {
  @ViewChild('refEditor') refEditor: ElementRef<AngularEditorComponent>;
  
  @Input() activity_id: string;
  @Input() comment: Commentary = {
    description: ''
  };
  @Input() disabled: boolean;

  @Output() added = new EventEmitter<Commentary>();
  @Output() deleted = new EventEmitter<Commentary>();
  
  user: User = {};
  prev: string = '';
  submitted: boolean = false;
  show: boolean = false;
  img_url: string;

  editorConfig: AngularEditorConfig = {
    editable: true,
    height: '100px',
    maxHeight: '100px',
    toolbarHiddenButtons: [[],['insertVideo','insertImage']],
    outline: false,
  };

  constructor(
    private toastr: ToastrService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    private commentService: CommentaryService,
  ) { }

  ngOnInit(): void {    
    this.fetchUser();
    if(this.comment.author?.image) {
      this.comment.author.image = this.comment.author.image.replace(/\\/g, '/');
      this.img_url = `${environment.apiURL.public}${this.comment.author?.image}`;
    }
  }

  showInput(val: boolean) {
    this.show = (this.disabled) ? !val : val;
    if(val) {
      this.prev = this.comment.description.slice();
      setTimeout(() => {
        this.refEditor.nativeElement?.focus();
      }, 0);
    }else{
      this.comment.description = this.prev.slice();
    }
  }

  update() {
    this.submitted = true;
    if (!this.comment.description) {
      this.toastr.error('¡El contenido no puede estar vacío!', null, { positionClass: 'toast-bottom-center' });
      return;
    }

    const data: Commentary = {
      description: this.comment.description,
      author: this.user?.id,
      activity: this.activity_id
    }

    if (this.comment?._id) {
      this.commentService.edit(data, this.comment._id)
        .pipe(first())
        .subscribe({
          next: res => {
            this.show = false;
            this.toastr.success("Se ha actualizado el comentario correctamente", null, { positionClass: 'toast-bottom-center' });
          }, error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          }
        });
    } else {
      this.commentService.add(data)
        .pipe(first())
        .subscribe({
          next: (res: any) => {
            this.show = false;
            res.commentary.author = this.user;
            res.commentary.author._id = this.user.id;
            this.added.emit(res.commentary);
            this.toastr.success("Se ha creado el comentario correctamente", null, { positionClass: 'toast-bottom-center' });
          }, error: err => {
            this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          }
        });
    }
  }

  deleteComment() {
    const modalRef = this.modalService.open(ModalComponent, { centered: true });
    modalRef.componentInstance.data = {
      title: `Dar de baja Comentario`,
      message: `El comentario será dado de baja. Recuerda que esta acción es irreversible. ¿Deseas Continuar?`,
      withReason: false,
    };

    modalRef.closed.subscribe({
      next: val => {
        if (val) {
          this.commentService.remove(this.comment._id)
            .pipe(first())
            .subscribe({
              next: res => {
                this.deleted.emit(this.comment);
                this.toastr.success("El comentario ha sido dado de baja.", null, { positionClass: 'toast-bottom-center' });
              },
              error: err => {
                this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
              }
            });
        }
      }
    });
  }
    
  fetchUser() {
    this.authService.currentUser.pipe(first()).subscribe({
      next: res => {
        this.user = res;
        if(!this.comment?._id && this.user.image) {
          
          this.user.image = this.user.image.replace(/\\/g, "/");
          this.img_url = `${environment.apiURL.public}${this.user.image}`;
        }
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    })
  }

  getAcronym(input: string) {
    return Utilities.generateAcronym(input);
  }

}
