import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Customer, CustomerInfo } from '../model/model';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:8089/api/v1/customers';
  private dataObservable = new BehaviorSubject<string>('');

  constructor(private http: HttpService) { }

  getDataObservable(): BehaviorSubject<string> {
    return this.dataObservable;
  }

  public getCustomers(): Observable<CustomerInfo[]> {
    let url = this.baseUrl + '/get';
    return this.http.doGet(url);
  }

  public getCustomer(id: string): Observable<CustomerInfo> {
    let url = this.baseUrl + '/get';
    return this.http.doGet(url + '/' + id);
  }

  public createCustomer(user: Customer): Observable<Customer> {
    let url = this.baseUrl + '/createAccount';
    return this.http.doPost(url, JSON.stringify(user));
  }

  public deleteCustomer(id: string): Observable<string> {
    let url = this.baseUrl + '/get';
    return this.http.doDelete(this.baseUrl + '/' + id);
  }

  public UpdateCustomer(id: string, user: CustomerInfo): Observable<CustomerInfo> {
    return this.http.doPut(this.baseUrl + '/' + id, JSON.stringify(user));
  }

  public notifyObservers(text: string): void {
    this.dataObservable.next(text);
  } 

}
