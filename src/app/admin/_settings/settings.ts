import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AdminService } from "../../_services/index";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "admin-settings",
  templateUrl: "./settings.html"
})
export class SettingComponent implements OnInit {
  public forgetPasswordForm: object;
  public advanceSettingForm: object;
  public loading: boolean;
  public selectedValue: string;
  public stakeVal: number;
  public quickStake1: number;
  public quickStake2: number;
  public quickStake3: number;
  public quickStake4: number;
  public quickStake5: number;
  public quickStake6: number;
  public confirm: boolean;
  public datasever: boolean;
  public onclick: boolean;
  public quickbet: boolean;
  public theme: string;
  public tabToggle: object;
  public getAccess: boolean = false;

  constructor(
    private adminService: AdminService,
    public snackBar: MatSnackBar
  ) {
    this.loading = false;
  }

  ngOnInit() {
    this.tabToggle = {};
    this.tabToggle["changePassword"] = true;

    let preferenceVal = JSON.parse(localStorage.getItem("preferenceVal"));
    this.stakeVal = preferenceVal.stakeVal;
    this.quickStake1 = preferenceVal.quickStake1;
    this.quickStake2 = preferenceVal.quickStake2;
    this.quickStake3 = preferenceVal.quickStake3;
    this.quickStake4 = preferenceVal.quickStake4;
    this.quickStake5 = preferenceVal.quickStake5;
    this.quickStake6 = preferenceVal.quickStake6;
    this.confirm = preferenceVal.confirm;
    this.datasever = preferenceVal.datasever;
    this.onclick = preferenceVal.onclick;
    this.quickbet = preferenceVal.quickbet;
    this.theme = preferenceVal.theme;

    //Get Advance Settings
    this.adminService.advanceSetting().subscribe(data => {
      if (data.status == 1) {
        this.getAccess = true;
        this.advanceSettingForm = new FormGroup({
          idleDt: new FormControl(data.data.idle_dt, Validators.required),
          cricketVal: new FormControl(
            data.data.cricket_vol,
            Validators.required
          ),
          soccerVal: new FormControl(data.data.soccer_vol, Validators.required),
          tennisVal: new FormControl(data.data.tennis_vol, Validators.required),
          horseVal: new FormControl(data.data.horse_vol, Validators.required)
        });
      }
    });

    this.forgetPasswordForm = new FormGroup({
      pwd_old: new FormControl("", Validators.required),
      pwd_new: new FormControl(),
      pwd_confirm: new FormControl()
    });
  }

  openTabs(id) {
    this.tabToggle = {};
    this.tabToggle[id] = true;
  }

  //Change Password
  onSubmit(form) {
    this.loading = true;
    this.adminService
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

  //Change Password
  onSubmitSetting(form) {
    this.loading = true;
    this.adminService.advanceSettingUpd(form).subscribe(data => {
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
        confirm: this.confirm,
        onclick: this.onclick,
        quickbet: this.quickbet,
        datasever: this.datasever,
        theme: this.theme
      })
    );
  }
}
