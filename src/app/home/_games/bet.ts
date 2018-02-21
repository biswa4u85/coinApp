import { Component, ElementRef, ViewChild, Input, Output, OnInit } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HomeService, LibraryService } from "../../_services/index";

import { Observable } from "rxjs/Observable";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { HomeComponent } from "../home.component";

@Component({ selector: "app-bet", templateUrl: "./bet.html" })
export class BetComponent implements OnInit {
  @Input() betDetails;
  @Output() currentBet: EventEmitter<any> = new EventEmitter<any>();
  public betForm: any;
  public oddsVal: number;
  public stakeVal: any;
  public defultStakeVal: any;
  public quickStake1: number;
  public quickStake2: number;
  public quickStake3: number;
  public quickStake4: number;
  public quickStake5: number;
  public quickStake6: number;
  public betOptions: string;
  public loading: boolean;
  public onclickResult: boolean;
  public initialized: boolean = false;

  constructor(
    private homeService: HomeService,
    private libraryService: LibraryService,
    public snackBar: MatSnackBar,
    public el: ElementRef,
    private homeComponent: HomeComponent
  ) {
    this.loading = false;
    this.onclickResult = true;
  }

  public ngOnInit() {
    this.initialized = true;

    //Get Quick Stake value
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"));
    this.defultStakeVal = preferenceVal.stakeVal;
    this.quickStake1 = preferenceVal.quickStake1;
    this.quickStake2 = preferenceVal.quickStake2;
    this.quickStake3 = preferenceVal.quickStake3;
    this.quickStake4 = preferenceVal.quickStake4;
    this.quickStake5 = preferenceVal.quickStake5;
    this.quickStake6 = preferenceVal.quickStake6;
    this.betOptions = preferenceVal.betOptions;

    if (this.betOptions == "oneclick") {
      this.placeBetAll(
        Number(this.betDetails.orgPrice),
        Number(this.defultStakeVal)
      );
    }

    this.betForm = new FormGroup({
      oddsVal: new FormControl(this.betDetails.orgPrice, Validators.required),
      stakeVal: new FormControl(this.defultStakeVal)
    });
  }

  setTempProfitVal() {
    this.homeService.setTempPrefit(
      this.betDetails.gSellIds,
      this.betDetails.gsid,
      this.betDetails.bType,
      this.betForm.controls["oddsVal"].value,
      this.betForm.controls["stakeVal"].value
    );
  }

  public closeBet(): void {
    this.currentBet.emit();
    if (this.betDetails.type !== "-8" && this.betDetails.type !== "-9") {
      this.homeService.setTempPrefit(
        this.betDetails.gSellIds,
        this.betDetails.gsid,
        "",
        null,
        null
      );
    }
  }

  //Set Stack Value
  changeStake(val) {
    this.betForm.controls["stakeVal"].setValue(Number(val));
  }

  //Increase
  incVal(type) {
    if (type == "odds") {
      let num: number = parseFloat(this.betForm.controls["oddsVal"].value);
      if (num <= 0) {
        num = 1;
      } else {
        num = parseFloat(
          (num + this.libraryService.oddsDiffCalculate(num)).toFixed(2)
        );
      }
      this.betForm.controls["oddsVal"].setValue(num);
    } else {
      let num: number = parseFloat(this.betForm.controls["stakeVal"].value);
      if (num <= 0) {
        num = 1;
      } else {
        num = num + this.libraryService.stakeDiffCalculate(num);
      }
      this.betForm.controls["stakeVal"].setValue(num);
    }
  }

  //Decrise
  decVal(type) {
    if (type == "odds") {
      let num = Number(this.betForm.controls["oddsVal"].value);
      if (num <= 0) {
        num = 1;
      } else {
        num = parseFloat(
          (num - this.libraryService.oddsDiffCalculate(num)).toFixed(2)
        );
        if (num < 1) {
          num = 1;
        }
      }
      this.betForm.controls["oddsVal"].setValue(num);
    } else {
      let num = Number(this.betForm.controls["stakeVal"].value);
      if (num <= 0) {
        num = 1;
      } else {
        num = num - this.libraryService.stakeDiffCalculate(num);
        if (num < 1) {
          num = 1;
        }
      }
      this.betForm.controls["stakeVal"].setValue(num);
    }
  }

  onSubmitBet(form) {
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"));
    if (preferenceVal.betOptions == "confirm") {
      if (window.confirm("Please confirm?")) {
        this.placeBetAll(Number(form.oddsVal), Number(form.stakeVal));
      }
    } else {
      this.placeBetAll(Number(form.oddsVal), Number(form.stakeVal));
    }
  }

  placeBetAll(oddsVal: number, stakeVal: number) {
    this.loading = true;
    let gid: number = this.betDetails.gid;
    let gsid: number = this.betDetails.gsid;
    let type: string = "";
    if (this.betDetails.bType == "layPrices_") {
      type = "l";
    } else {
      type = "b";
    }
    let odds: number;
    let stake: number;
    if (this.betDetails.type == 4) {
      odds = oddsVal;
      stake = stakeVal;
    } else {
      odds = oddsVal;
      stake = stakeVal;
    }

    this.homeService.placeBetNew(gid, gsid, type, odds, stake, this.betDetails.type, this.betDetails.orgAmount).subscribe(data => {
      if (data.status == 1 || data.status == 2 || data.status == 3) {
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
        this.closeBet();
        this.onclickResult = false;
        this.loading = false;
      } else {
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-danger"]
        });
        this.onclickResult = false;
        this.loading = false;
      }
    });
  }
}
