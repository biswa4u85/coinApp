import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Pipe({
  name: "inPlayfilter"
})
@Injectable()
export class inPlayFilterPipe implements PipeTransform {
  transform(items: any[], field: string, value: boolean): any[] {
    if (!items) return [];
    if (!value) return items;
    return items.filter(it => it[field] == value);
  }
}
