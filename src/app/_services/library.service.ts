import { Injectable } from "@angular/core";
import * as moment from "moment";
var CryptoJS = require("crypto-js")
import { LocalStorageService, SessionStorageService } from "ngx-webstorage"
import { Users } from '../_interface'
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
    return CryptoJS.AES.encrypt(val, 'password').toString()
  }

  dncVal(val) {
    var decrypted = CryptoJS.AES.decrypt(val, 'password')
    return decrypted.toString(CryptoJS.enc.Utf8)
  }

  googleFormatData(data: any) {
    let tempData: any[] = []
    let tempDataLength = data.values[0].length
    for (let i = 1; i < tempDataLength; i++) {
      let tempObj = {}
      for (let j = 0; j < tempDataLength; j++) {
        let name = data.values[0][j]
        let val = data.values[i][j]
        tempObj[name] = val
      }
      tempData.push(tempObj)
    }
    return tempData
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
