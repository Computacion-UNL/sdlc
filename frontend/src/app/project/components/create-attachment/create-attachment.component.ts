import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ToastrService } from 'ngx-toastr';

import { AttachmentService } from '@app/_services/attachment.service';
import { Attachment } from '@app/_models/attachment';
import { first } from 'rxjs';

@Component({
  selector: 'app-create-attachment',
  templateUrl: './create-attachment.component.html',
  styleUrls: ['./create-attachment.component.scss']
})
export class CreateAttachmentComponent implements OnInit {
  @Input() type: string;
  @Input() activity: string;
  @Input() attachment: Attachment;
  @Output() refresh = new EventEmitter<Attachment>();

  @ViewChild('content') modal: ElementRef<HTMLInputElement>;

  form: FormGroup;
  show: boolean;
  submitted: boolean = false;
  loading: boolean = false;


  constructor(
    private modalService: NgbModal,
    private toastr: ToastrService,
    private attachmentService: AttachmentService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.show = (this.type === 'url') ? true : false;
    this.validateForm();
  }

  ngOnChanges() {
    if (this.attachment._id) {
      this.validateForm();
      this.modalService.open(this.modal);
    }
  }

  get fa() { return this.form.controls }

  private validateForm() {
    let urlRegex = /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?%#[\]@!\$&'\(\)\*\+,;=.]+$/;
    this.form = this.formBuilder.group({
      name: [(this.attachment._id) ? this.attachment?.name : '', Validators.required],
      url: [(this.attachment._id) ? this.attachment?.url : '',
      (this.type === 'url') ? [Validators.required, Validators.pattern(urlRegex)] : ''],
      file: ['', (this.type === 'file' && !this.attachment?._id) ? Validators.required : ''],
      fileSource: ['', (this.type === 'file' && !this.attachment?._id) ? Validators.required : '']
    });
  }

  open(content) {
    this.attachment = {};
    this.validateForm();
    this.modalService.open(content).result.then(res => {
    }, reason => {
      this.resetForm();
    });
  }

  uploadFile(event: any) {
    if (event.target.files[0]) {
      const file: File = event.target.files[0];
      this.form.patchValue({
        fileSource: file,
        name: file.name,
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid)
      return;
    this.loading = true;
    this.modalService.dismissAll();

    const data: Attachment = {
      name: this.fa['name'].value,
      activity: this.activity,
      type: this.type,
    }

    if (this.attachment._id) {
      if (this.attachment.type === 'file' && this.fa['fileSource'].value) {
        data.file = this.fa['fileSource'].value;
      } else {
        data.url = this.fa['url'].value;
      }

      this.attachmentService.edit(data, this.attachment._id).pipe(first()).subscribe({
        next: res => {
          this.toastr.success("Se ha editado el elemento adjunto correctamente.", null, { positionClass: 'toast-bottom-center' });
          this.refresh.emit(res);
          this.resetForm();
          this.loading = false;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
    } else {
      data.url = (this.type === 'url') ? this.fa['url'].value : '';
      data.file = (this.type === 'file') ? this.fa['fileSource'].value : '';

      this.attachmentService.add(data).pipe(first()).subscribe({
        next: res => {
          this.toastr.success("Se ha adjuntado el elemento correctamente.", null, { positionClass: 'toast-bottom-center' });
          this.refresh.emit(res);
          this.resetForm();
          this.loading = false;
        },
        error: err => {
          this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
          this.loading = false;
        }
      });
    }
  }

  deleteAttachment(attachment: Attachment) {
    this.loading = true;
    this.modalService.dismissAll();
    this.attachmentService.remove(attachment._id).pipe(first()).subscribe({
      next: res => {
        this.toastr.success("Se ha dado de baja el elemento correctamente.", null, { positionClass: 'toast-bottom-center' });
        this.refresh.emit(res);
        this.loading = false;
      },
      error: err => {
        this.toastr.error(err, null, { positionClass: 'toast-bottom-center' });
        this.loading = false;
      }
    });
  }

  resetForm() {
    this.form.reset();
    this.submitted = false;
    this.loading = false;
  }

}
