import { HttpClient , HttpErrorResponse} from "@angular/common/http";
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonUtil } from '../utils/common.util';
import { TransactionService } from '../services/transaction.service';
import { UserService } from '../services/user.service';
import { first } from "rxjs/operators";
import { Observable, of, from, throwError , Subscription} from "rxjs";
import { Customer, CustomerInfo } from '../model/model';
import { map, catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from "@angular/router";


@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css'],
})
export class TransactionComponent implements OnInit, OnDestroy {
  
  users: CustomerInfo[] = {} as CustomerInfo[];
  observer: Subscription;
  balance = 5824.76;
  fromStr = 'Free Checking(4692) - $' + this.balance;
  filterStr = '';
  toAcc = '';
  amt= 33;
  firstName = 'user';
  lastName = 'sdf';
  customerId = 'dsfd';
  error = "";
  order = 'asc';
  transactionsArray: any = [];
  fieldName = '';
  isSubmitted = false;
  loading = false;
  submitted = false;
  
  constructor(private route: ActivatedRoute,
    private router: Router,private transactionService: TransactionService, private userService: UserService , 
    private http: HttpClient) {
      this.userService.getCustomers().subscribe(data => {this.users = data;});
      this.observer = this.userService.getDataObservable().subscribe(
        () => {
          this.userService.getCustomers().subscribe(data => {
            this.users = data;
          });
        }
      );
    }


  ngOnInit(): void {
    this.transactionService.getTransactions().subscribe(
      (response: any) => {
        this.transactionsArray = response.data;
      },
      (err) => {
        alert(err);
      }
    );
  }

  getMerchantLogoUrl(merchantName: string) {
    return CommonUtil.getMerchantLogoUrl(merchantName);
  }
  
  sort(f: any) {
    if(f == this.fieldName) {
      if(this.order == 'asc') {
        this.order = 'desc';
      } else if(this.order == 'desc'){
        this.order = '';
      } else {
        this.order = 'asc';
      }
    } else {
      this.fieldName = f;
      this.order = 'asc';
    }
  }
  
  ngOnDestroy(): void {
    this.observer.unsubscribe();
  }

  
  clearFilterField() {
    this.filterStr = '';
  }
}
