import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { Ng2DeviceService } from "ng2-device-detector";

import { environment } from "../../environments/environment";
declare let subscribeUser: any;
@Injectable()
export class LoginService {
  constructor(
    private http: Http,
    private sessionStore: SessionStorageService,
    private deviceService: Ng2DeviceService
  ) { }

  login(username: string, password: string) {
    let options = {
      params: {
        pwd: password,
        username: username
      }
    };
    return this.http
      .get(environment.apiUrl + "user_login", options)
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        let user = response.json();
        if (user.status == 1) {
          this.sessionStore.store("userDetails", JSON.stringify(user));
          if ("serviceWorker" in navigator && "PushManager" in window) {
            subscribeUser(user.data.user_id);
          }
        }
        return user;
      });
  }

  adminLogin(username: string, password: string) {
    let options = {
      params: {
        pwd: password,
        username: username
      }
    };
    return this.http
      .get(environment.apiUrl + "admin_login", options)
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        let user = response.json();
        if (user.status == 1) {
          this.sessionStore.store("adminUserDetails", JSON.stringify(user));
        }
        return user;
      });
  }

  logout() {
    // remove user from local storage to log user out
    this.sessionStore.store("userDetails", null);
  }

  adminLogout() {
    // remove user from local storage to log user out
    this.sessionStore.store("adminUserDetails", null);
  }
}
