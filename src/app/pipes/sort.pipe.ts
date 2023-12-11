import { Pipe, PipeTransform } from '@angular/core';
import { CommonUtil } from '../utils/common.util';

@Pipe({
  name: 'sort',
})
export class SortPipe implements PipeTransform {
  transform(array: any, field: string, order: string): any[] {
    if (order == 'asc' || order == 'desc') {
      switch (field) {
        case 'date':
          array.sort((a: any, b: any) =>
            CommonUtil.compare(a.dates.valueDate, b.dates.valueDate)
          );
          break;
        case 'name':
          array.sort((a: any, b: any) =>
            CommonUtil.compare(a.merchant.name, b.merchant.name)
          );
          break;
        case 'amount':
          array.sort((a: any, b: any) =>
            CommonUtil.compare(
              +a.transaction.amountCurrency.amount,
              +b.transaction.amountCurrency.amount
            )
          );
          break;
      }
    }
    if (order == 'desc') {
      array.reverse();
    }
    return array;
  }
}
