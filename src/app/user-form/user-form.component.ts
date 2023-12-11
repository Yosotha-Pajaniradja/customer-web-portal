import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Customer } from '../model/model';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit, OnChanges {

  @Input()
  user: Customer = {} as Customer;

  @Output()
  myCancel: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  mySubmit: EventEmitter<Customer> = new EventEmitter<Customer>();

  userForm = this.formBuilder.group({
    customerIdentifier: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    accountNumber: ['', [Validators.required]],
    creditAmount:  ['', [Validators.required]]
  });

  constructor(private formBuilder: FormBuilder ) {  }

  ngOnInit(): void {
  
  }

  ngOnChanges() {
    this.userForm.controls.firstName.setValue(this.user.firstName);
    this.userForm.controls.lastName.setValue(this.user.lastName);
    this.userForm.controls.customerIdentifier.setValue(this.user.customerIdentifier);
    this.userForm.controls.creditAmount.setValue(this.user.creditAmount);
    this.userForm.controls.accountNumber.setValue(this.user.accountNumber);

    if (this.user) {
      this.userForm.controls.password.clearValidators();
      this.userForm.controls.password.updateValueAndValidity();
      this.userForm.controls.confirm.clearValidators();
      this.userForm.controls.confirm.updateValueAndValidity();
    }
  }
    

  onSubmit() {
    let myUser: Customer = this.userForm.value;
   // myUser.customerIdentifier = this.user.customerIdentifier;
    this.mySubmit.emit(myUser);
  
  }

  onCancel() {
    this.myCancel.emit('Cancel');
  }

  getErrorMessageForRequired(): string {
    return 'You must enter a value'
  }

  getErrorMessageForEmail(): string {
    if (this.userForm.controls.email.hasError('required')) {
      return this.getErrorMessageForRequired();
    }
    return this.userForm.controls.email.hasError('email') ? 'Not a valid email' : '';
  }

  getErrorMessageForRepeatPassword(): string {
    if (this.userForm.controls.confirm.hasError('required')) {
      return this.getErrorMessageForRequired();
    }
    return this.userForm.controls.confirm.hasError('passwordNotEqual') ? 'Does not match with password' : '';
  }

}
