import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Customer, CustomerInfo } from '../model/model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

  users: CustomerInfo[] = {} as CustomerInfo[];
  observer: Subscription;
  displayedColumns: string[] = ['customerIdentifier', 'firstName', 'lastName', 'accountNumber' ];

  @ViewChild(MatTable) table: MatTable<any> = {} as MatTable<any>;

  constructor(private userService: UserService, private router: Router) {
    this.userService.getCustomers().subscribe(data => {this.users = data;});
    this.observer = this.userService.getDataObservable().subscribe(
      () => {
        this.userService.getCustomers().subscribe(data => {
          this.users = data;
          this.table.renderRows();
        });
      }
    );
    
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.observer.unsubscribe();
  }

  onClick(user: CustomerInfo): void {
      this.router.navigate(['/modify', user.customerIdentifier]);
  }

  delete(event: any, user: CustomerInfo): void {
    this.userService.deleteCustomer(user.customerIdentifier).subscribe(data => {
      this.userService.getCustomers().subscribe(data => {
        this.users = data;
        this.table.renderRows();
      });

    });
    event.stopPropagation();
  }

}
