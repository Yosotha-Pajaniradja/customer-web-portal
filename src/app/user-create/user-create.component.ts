import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Customer } from '../model/model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {


  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void { }

  onSubmit(user: Customer) {
    this.userService.createCustomer(user).subscribe(data => {
      this.router.navigateByUrl('');
      this.userService.notifyObservers('Create Account');
    });
  }

  onCancel() {
    this.router.navigateByUrl('');
  }

}
