import { Injectable } from "@angular/core";
import * as moment from "moment";
var CryptoJS = require("crypto-js")
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
declare var require: any

@Injectable()
export class LibraryService {
  constructor(
    private sessionStore: SessionStorageService
  ) { }


  //Inner HTML Update
  innerHTMLUpdate(id, value) {
    let elem = document.getElementById(id);
    if (elem) {
      elem.innerHTML = value;
    }
  }

  encVal(val) {
    let valText = CryptoJS.enc.Utf8.parse(val)
    let newValText = ''
    for (let item of valText.words) {
      newValText = newValText + item
    }
    return newValText
  }

  formatDate(getDate) {
    let date = moment.utc(getDate, "YYYY-MM-DD HH:mm:ss").toDate();
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    // hour = this.checkTime(hour);
    // min = this.checkTime(min);
    // sec = this.checkTime(sec);
    let milisec = date.getMilliseconds();
    // return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec +
    // ':' + milisec;
    return day + "th " + monthNames[month] + " " + hour + ":" + min + ":" + sec;
  }

}
