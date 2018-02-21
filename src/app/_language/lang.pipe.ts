// app/translate/translate.pipe.ts

import { Pipe, PipeTransform } from "@angular/core";
// import { LangService } from '../_language/index'; // our translate service

@Pipe({
  name: "translate",
  pure: false // impure pipe, update value when we change language
})
export class LangPipe implements PipeTransform {
  // constructor(private _translate: LangService) { }
  constructor() {}

  transform(value: string, args: string | string[]): any {
    if (!value) return;

    // return this._translate.instant(value, args);
    return value;
  }
}
