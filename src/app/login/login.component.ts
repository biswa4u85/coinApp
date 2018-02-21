import { Component, OnInit, Inject } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { LoginService } from "../_services/index";
import { MatSnackBar, MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { SessionStorageService } from "ngx-webstorage";
import { Ng2DeviceService } from "ng2-device-detector";
// import { CookieService } from 'angular2-cookie/core';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public userType: string;
  public rememberUsers: any;
  public loading: boolean;
  public returnUrl: string;
  public theme: string;
  public termsConditions: boolean = false;
  public deviceInfo: string;
  public domainInfo: string;
  dialogRef: MatDialogRef<TermsDialog> | null;

  constructor(
    private router: Router,
    private deviceService: Ng2DeviceService,
    private sessionStore: SessionStorageService,
    private loginService: LoginService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) // private cookieService: CookieService
  {
    let currentUrl = this.router.url;
    if (currentUrl === "/login") {
      this.userType = "user";
    } else if (currentUrl === "/line") {
      this.userType = "line";
    } else if (currentUrl === "/board") {
      this.userType = "board";
    } else if (currentUrl === "/fancy") {
      this.userType = "fancy";
    } else {
      this.userType = "admin";
    }

    this.loading = false;
    this.rememberUsers = JSON.parse(
      localStorage.getItem("remember" + this.userType + "User")
    );
  }

  ngOnInit() {
    if (this.userType === "user") {
      this.loginService.logout();
    } else {
      this.loginService.adminLogout();
    }

    // Set Long Home Value
    if (!localStorage.getItem("longHome")) {
      localStorage.setItem("longHome", JSON.stringify({ longHome: true }));
    }

    // Set Preference Value
    if (!localStorage.getItem("preferenceVal")) {
      localStorage.setItem(
        "preferenceVal",
        JSON.stringify({
          stakeVal: 100,
          quickStake1: 100,
          quickStake2: 125,
          quickStake3: 500,
          quickStake4: 2000,
          quickStake5: 5000,
          quickStake6: 10000,
          betOptions: "normal",
          quickbet: false,
          datasever: false,
          theme: "default",
          deviceInfo: "destopView",
          domainInfo: "allexch"
        })
      );
    }

    //Put Device Info
    let deviceDetails = this.deviceService.getDeviceInfo();
    this.domainInfo = window.location.hostname
    if (deviceDetails.device == "unknown") {
      this.deviceInfo = "destopView";
    } else {
      this.deviceInfo = "mobileView";
    }

    //Update preference val with mobile/desktop view and re-save
    //TODO:device info boolean
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"));
    preferenceVal.deviceInfo = this.deviceInfo;
    preferenceVal.domainInfo = this.domainInfo;
    this.theme = preferenceVal.theme;
    localStorage.setItem("preferenceVal", JSON.stringify(preferenceVal));

    //Set Favorite Games
    if (!localStorage.getItem("favoriteGames")) {
      localStorage.setItem("favoriteGames", JSON.stringify({ 0: true }));
    }

    if (this.rememberUsers) {
      this.loginForm = new FormGroup({
        username: new FormControl(
          this.rememberUsers.username,
          Validators.required
        ),
        password: new FormControl(this.rememberUsers.password),
        remember: new FormControl(this.rememberUsers.remember)
      });
    } else {
      this.loginForm = new FormGroup({
        username: new FormControl("", Validators.required),
        password: new FormControl(),
        remember: new FormControl()
      });
    }
  }

  onSubmit(form: any) {
    if (this.userType === "user") {
      this.launchIntoFullscreen(document.documentElement);
      this.loading = true;
      this.loginService.login(form.username, form.password).subscribe(data => {
        if (data.status == 1) {
          // if (this.cookieService.get('setTermsCheck') !== 'true') {
          //Check Torms
          let options = {};
          if (this.deviceInfo === "destopView") {
            options = { width: "50%", position: { top: "20px" } };
          } else {
            options = { width: "90%", position: { top: "20px" } };
          }

          let dialogRef = this.dialog.open(TermsDialog, options);
          dialogRef.afterClosed().subscribe(result => {
            if (result === "true") {
              let now = new Date();
              let expTime = now.setTime(now.getTime() + 5 * 3600 * 1000);
              //  this.cookieService.put('setTermsCheck', 'true', { expires: new Date(expTime) })
              this.router.navigate([""]);
            } else {
              this.loading = false;
              this.sessionStore.store("userDetails", null);
            }
          });

          // } else {
          //   this.router.navigate([''])
          // }

          //Set Remember Me Value
          if (form.remember) {
            localStorage.setItem(
              "remember" + this.userType + "User",
              JSON.stringify(form)
            );
          } else {
            localStorage.removeItem("remember" + this.userType + "User");
          }
        } else {
          this.snackBar.open(data.error, undefined, {
            duration: 3000,
            extraClasses: ["alert-danger"]
          });
          this.loading = false;
        }
      });
    } else {
      this.loginService
        .adminLogin(form.username, form.password)
        .subscribe(data => {
          if (data.status == 1) {
            if (this.userType === "admin") {
              this.router.navigate(["dashboard"]);
            } else if (this.userType === "line") {
              this.router.navigate(["lineboard"]);
            } else if (this.userType === "board") {
              this.router.navigate(["adminboard"]);
            } else if (this.userType === "fancy") {
              this.router.navigate(["fancyboard"]);
            }

            //Set Remember Me Value
            if (form.remember) {
              localStorage.setItem(
                "remember" + this.userType + "User",
                JSON.stringify(form)
              );
            } else {
              localStorage.removeItem("remember" + this.userType + "User");
            }
          } else {
            this.snackBar.open(data.error, undefined, {
              duration: 3000,
              extraClasses: ["alert-danger"]
            });
            this.loading = false;
          }
        });
    }
  }

  launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
}

@Component({
  selector: "terms-conditions",
  template: `  
  <div class="termsBg">
  <h3>Terms & Conditions Agreement</h3>
  <div class="termCont  scrollbar" id="style-6">
  <span class="firstLine">All Exchange users are advised to read following <strong>‘Terms and Condition’</strong>, Any user who will place bet in All Exchange is understood to be agreeing and accepting following:</span>
  
  <p>Any sort of cheating bet , any sort of <strong>Matching (Passing of funds)</strong>, Court Siding <strong>(Ghaobaazi on commentary), Sharpening, Commission making</strong> is not allowed in All Exchange, If any All Exchange User is caught in any of such act then all the funds belonging that account would be seized and confiscated. No argument or claim in that context would be entertained and the decision made by All Exchange management will stand as final authority.</p>
  
  <p><strong>Fluke hunting/Seeking</strong> is prohibited in All Exchange, All the fluke bets will be reversed.
  Cricket commentary is just an additional feature and facility for All Exchange user but All Exchange is not responsible for any delay or mistake in commentary.</p>
  
  <p>In case of any technical issue or disruption of services, All Exchange is neither liable nor responsible to pay any losses.</p>
  
  <p><a href="https://www.betfair.com/in">Betfair.com</a> reserves the right to reverse, resettle or void any Market or bet in case of result change or mistake, etc , All Exchange in that case will settle according to Betfair.com.</p>
  
  <p>The decision made by All Exchange in any matter is of utmost importance and final authority.</p>  
  </div>
  <div class="termsFooter">
  <input class="closeButt" type="button" value="Disagree" (click)="dialogRef.close('false')"/>
  <mat-checkbox (click)="dialogRef.close('true')">{{ 'Agree' | translate }}</mat-checkbox>
  </div>
  </div>`
})
export class TermsDialog {
  constructor(public dialogRef: MatDialogRef<TermsDialog>) { }
}
