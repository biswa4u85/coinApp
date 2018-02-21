import { Injectable } from "@angular/core";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private sessionStore: SessionStorageService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.sessionStore.retrieve("adminUserDetails")) {
      return true;
    }
    this.router.navigate(["/admin"]);
    return false;
  }
}
