import { Injectable } from "@angular/core";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private sessionStore: SessionStorageService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.sessionStore.retrieve("userDetails")) {
      return true;
    }
    this.router.navigate(["/login"]);
    return false;
  }
}
