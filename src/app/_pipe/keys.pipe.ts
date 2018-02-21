import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Pipe({
  name: "keys",
  pure: false
})
@Injectable()
export class KeysPipe implements PipeTransform {
  transform(value, args: string[]): any {
    let keys = [];
    for (let key in value) {
      keys.push({ key: key, value: value[key] });
    }
    return keys;
  }
}
