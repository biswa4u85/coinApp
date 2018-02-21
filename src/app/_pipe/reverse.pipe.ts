import { Pipe, PipeTransform, Injectable } from "@angular/core";

@Pipe({
  name: "reverse"
})
export class ReversePipe {
  transform(arr) {
    var copy = arr.slice();
    return copy.reverse();
  }
}
