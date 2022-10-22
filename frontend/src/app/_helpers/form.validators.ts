import { FormArray, FormControl, FormGroup, ValidatorFn } from "@angular/forms";

export function DateLessThan(dateField1: string, dateField2: string) {
    return (formGroup: FormGroup) => {
        const date1 = formGroup.controls[dateField1];
        const date2 = formGroup.controls[dateField2];

        if (date2.errors && !date2.errors["dateLessThan"]) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        if((date1.value !== null && date2.value !== null) && date1.value > date2.value){
            date2.setErrors({ "dateLessThan": true });
        }else{
            date2.setErrors(null);
        }
    };
}

export function minSelectedCheckboxes(min = 1) {
    const validator: ValidatorFn = (formArray: FormArray) => {
      const totalSelected = formArray.controls
        // get a list of checkbox values (boolean)
        .map(control => control.value)
        // total up the number of checked checkboxes
        .reduce((prev, next) => next ? prev + next : prev, 0);
      // if the total is not greater than the minimum, return the error message
      return totalSelected >= min ? null : { "required": true };
    };
  
    return validator;
}

export function noWhiteSpaceValidator(input: string) {
    return (formgroup: FormGroup) => {
        const field = formgroup.controls[input];
    
        if (field.errors && !field.errors["whitespace"]) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        if(!field.value?.trim()) {
            field.setErrors({ whitespace: true });
        }else{
            field.setErrors(null);
        }
    }
}