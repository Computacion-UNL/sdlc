import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";


export const confirmPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirm_password = control.get('confirm_password');

    return password?.value === confirm_password?.value ? null : {notmatched: true};
  };

export const confirmNewPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('newPassword');
    const confirm_password = control.get('confirm_password');

    return password?.value === confirm_password?.value ? null : {notmatched: true};
  };