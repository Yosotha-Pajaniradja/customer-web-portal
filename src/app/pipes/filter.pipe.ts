import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(values: any[], filterStr: string): unknown {
    let filteredValues = values.filter((v) => {
      return (
        v.merchant.name.toLowerCase().includes(filterStr.toLowerCase()) ||
        v.transaction.type.toLowerCase().includes(filterStr.toLowerCase())
      );
    });
    return filteredValues;
  }
}
