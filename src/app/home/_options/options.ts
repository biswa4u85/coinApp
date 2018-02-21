import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HomeService } from "../../_services/index";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "app-options",
  templateUrl: "./options.html"
})
export class OptionsComponent implements OnInit {
  public forgetPasswordForm: any;
  public loading: boolean;
  public selectedValue: string;
  public stakeVal: number;
  public quickStake1: number;
  public quickStake2: number;
  public quickStake3: number;
  public quickStake4: number;
  public quickStake5: number;
  public quickStake6: number;
  public datasever: boolean;
  public betOptions: string;
  public theme: string;
  public deviceInfo: string;
  public tabToggle: object;

  constructor(private homeService: HomeService, public snackBar: MatSnackBar) {
    this.loading = false;
  }

  ngOnInit() {
    let preferenceVal = JSON.parse(localStorage.getItem("preferenceVal"));
    this.stakeVal = preferenceVal.stakeVal;
    this.quickStake1 = preferenceVal.quickStake1;
    this.quickStake2 = preferenceVal.quickStake2;
    this.quickStake3 = preferenceVal.quickStake3;
    this.quickStake4 = preferenceVal.quickStake4;
    this.quickStake5 = preferenceVal.quickStake5;
    this.quickStake6 = preferenceVal.quickStake6;
    this.datasever = preferenceVal.datasever;
    this.betOptions = preferenceVal.betOptions;
    this.theme = preferenceVal.theme;
    this.deviceInfo = preferenceVal.deviceInfo;

    this.forgetPasswordForm = new FormGroup({
      pwd_old: new FormControl("", Validators.required),
      pwd_new: new FormControl(),
      pwd_confirm: new FormControl()
    });

    this.tabToggle = {};
    this.tabToggle["changePassword"] = true;
  }

  openTabs(id) {
    this.tabToggle = {};
    this.tabToggle[id] = true;
  }

  onSubmit(form) {
    this.loading = true;
    this.homeService
      .changePwd(form.pwd_old, form.pwd_new, form.pwd_confirm)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.selectedValue = "";
          this.loading = false;
        } else {
          this.snackBar.open(data.error, undefined, {
            duration: 3000,
            extraClasses: ["alert-danger"]
          });
          this.loading = false;
        }
      });
  }

  //Save Preference Value
  onChangePreference() {
    localStorage.setItem(
      "preferenceVal",
      JSON.stringify({
        stakeVal: this.stakeVal,
        quickStake1: this.quickStake1,
        quickStake2: this.quickStake2,
        quickStake3: this.quickStake3,
        quickStake4: this.quickStake4,
        quickStake5: this.quickStake5,
        quickStake6: this.quickStake6,
        betOptions: this.betOptions,
        datasever: this.datasever,
        theme: this.theme,
        deviceInfo: this.deviceInfo
      })
    );
  }
}
