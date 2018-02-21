import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map"
import { Router } from "@angular/router"
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { Ng2DeviceService } from "ng2-device-detector"
import { LibraryService } from './library.service'
import { GoogleDriveProvider } from './google-drive.service'
declare var require: any


@Injectable()
export class LoginService {

  public userTableId: string

  constructor(
    private http: Http,
    private router: Router,
    private sessionStore: SessionStorageService,
    private deviceService: Ng2DeviceService,
    private gDrive: GoogleDriveProvider,
    private libraryService: LibraryService
  ) {
    this.userTableId = '1Cawr42EEHk1shXatXTNE86HIblMryc3TUE-Y9sD7wKk'
  }

  adminLogin(form: any) {
    let password = this.libraryService.encVal(form.password)
    let option = { email: form.email, password: password, status: "1" }
    return new Promise(resolve => {
      this.gDrive.load(this.userTableId).then((data: any) => {
        for (let item of data) {
          if (item.email == option.email && item.password == option.password && item.status == option.status) {
            this.sessionStore.store("userDetails", JSON.stringify(item));
            resolve(item)
          }
        }
      })
    })
  }

  logout() {
    // remove user from local storage to log user out
    this.sessionStore.store("userDetails", null)
    this.router.navigate(['/login'])
  }
}
