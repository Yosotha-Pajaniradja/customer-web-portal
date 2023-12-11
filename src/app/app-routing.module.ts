import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserListComponent } from './user-list/user-list.component';
import { TransactionComponent } from './customer-list/transaction.component';

const routes: Routes = [
  { path: 'create', component: UserCreateComponent },
  { path: '', component: UserListComponent },
  { path: 'viewCustomers', component: TransactionComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
