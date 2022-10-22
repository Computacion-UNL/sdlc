import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { confirmNewPassword } from '@app/auth/password-confirm.directive';
import { noWhiteSpaceValidator } from '@app/_helpers/form.validators';
import { Setting } from '@app/_models/setting';
import { SettingService } from '@app/_services/setting.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-config-forms',
  templateUrl: './config-forms.component.html',
  styleUrls: ['./config-forms.component.scss']
})
export class ConfigFormsComponent implements OnInit {
  form_setting: FormGroup;
  loading_setting: boolean = false;
  submitted_form: boolean = false;

  constructor(
    private settingService: SettingService,
    private toastService: ToastrService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form_setting = this.formBuilder.group({
      host: ['', Validators.required],
      port: ['', Validators.required],
      user: ['', Validators.required],
      sender: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirm_password: ['', Validators.required],
      secure: [false, Validators.required],
    }, { validator: [
        noWhiteSpaceValidator('host'),
        noWhiteSpaceValidator('port'),
        noWhiteSpaceValidator('user'),
        noWhiteSpaceValidator('sender'),
        noWhiteSpaceValidator('newPassword'),
        noWhiteSpaceValidator('confirm_password'),
        confirmNewPassword
      ] 
    });
    this.getSMTPSetting();
  }

  getSMTPSetting() {
    this.settingService.get('smtp').subscribe(
      (data) => {
        this.f['host'].setValue(data?.value?.host);
        this.f['port'].setValue(data?.value?.port);
        this.f['user'].setValue(data?.value?.user);
        this.f['sender'].setValue(data?.value?.sender);
        this.f['secure'].setValue(data?.value?.secure || false);
      }
    );
  }

  get f() { return this.form_setting.controls }

  // Guarda o actualiza la configuración
  onSubmit() {
    this.submitted_form = true;
    if(this.form_setting.invalid) {
      return;
    }

    this.loading_setting = true;
    const data: Setting = {
      slug: 'smtp',
      value: {
        host: this.f['host'].value,
        port: this.f['port'].value,
        user: this.f['user'].value,
        sender: this.f['sender'].value,
        password: this.f['newPassword'].value,
        secure: this.f['secure'].value == 'true'
      }
    };

    console.log(data)

    this.settingService.add('smtp', data)
    .subscribe({
      next: data => {
        this.loading_setting = false;
        this.submitted_form = false;
        this.f['newPassword'].reset();
        this.f['confirm_password'].reset();
        this.toastService.success('Configuración actualizada correctamente', null, { positionClass: 'toast-bottom-center' });
      },
      error: err => {
        this.loading_setting = false;
        this.submitted_form = false;
        this.toastService.error(err, null, { positionClass: 'toast-bottom-center' });
      }
    });
  }

}
