import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GET_TRANSACTIONS_URL } from "./url.constant";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TransactionService {
  constructor(private http: HttpClient) {}

  public getTransactions(): Observable<any> {
    return this.http.get(GET_TRANSACTIONS_URL);
  }
}
