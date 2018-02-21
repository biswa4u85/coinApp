import { Component, OnInit, Input, ChangeDetectorRef } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HomeService, LibraryService } from "../../_services/index";
import { MatSnackBar } from "@angular/material";
import { HomeComponent } from "../home.component";

@Component({ selector: "app-keyboard", templateUrl: "./keyboard.html" })
export class KeyboardComponent implements OnInit {
  @Input() betDetails;
  public detailsVal: any;
  public betForm: any;
  public betOptions: string;
  public oddsVal: number;
  public stakeVal: number;
  public defultStakeVal: number;
  public quickStake1: number;
  public quickStake2: number;
  public quickStake3: number;
  public quickStake4: number;
  public quickStake5: number;
  public quickStake6: number;

  public preferenceVal: any;
  public loading: boolean;
  public deviceInfo: string;
  public onclickResult: boolean;
  public keyBoardStatus: boolean;
  public textBoxName: string = "";

  constructor(
    private homeComponent: HomeComponent,
    public homeService: HomeService,
    private libraryService: LibraryService,
    public snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.loading = false;
  }

  ngOnInit() { }

  public ngAfterViewChecked() {
    this.cdr.detectChanges();
    // this.setTempProfitVal();
  }

  ngOnChanges() {
    //Get Quick Stake value
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"));
    this.defultStakeVal = preferenceVal.stakeVal;
    this.betOptions = preferenceVal.betOptions;
    this.deviceInfo = preferenceVal.deviceInfo;
    this.quickStake1 = preferenceVal.quickStake1;
    this.quickStake2 = preferenceVal.quickStake2;
    this.quickStake3 = preferenceVal.quickStake3;
    this.quickStake4 = preferenceVal.quickStake4;
    this.quickStake5 = preferenceVal.quickStake5;
    this.quickStake6 = preferenceVal.quickStake6;
    this.betForm = new FormGroup({
      oddsVal: new FormControl("", Validators.required),
      stakeVal: new FormControl("", Validators.required)
    });

    //Get Value
    this.detailsVal = this.homeService.getPlaceBetValue();
    this.betForm.controls["oddsVal"].setValue(this.detailsVal.orgPrice);
    this.betForm.controls["stakeVal"].setValue(this.defultStakeVal);
    if (Object.keys(this.detailsVal).length !== 0) {
      this.setTempProfitVal();
    }
  }

  setTempProfitVal() {
    if (this.betDetails.type !== "-8") {
      setTimeout(() => {
        this.homeService.setTempPrefit(
          this.betDetails.gSellIds,
          this.betDetails.gsid,
          this.betDetails.bType,
          this.betForm.controls["oddsVal"].value,
          this.betForm.controls["stakeVal"].value
        );
      });
    }
  }

  public closeBet(): void {
    if (this.betDetails.type !== "-8") {
      this.homeService.setTempPrefit("");
    }
    this.detailsVal = {};
    this.homeService.setMobileTabActive("");
  }

  //Open Key Board Value
  openKeyBoard(textBox) {
    this.keyBoardStatus = true;
    this.textBoxName = textBox;
  }

  //Set Key Board Value
  keyboard(val: string) {
    let oddsVal: string = String(this.betForm.controls["oddsVal"].value);
    let stakeVal: string = String(this.betForm.controls["stakeVal"].value);
    var keyValue = String(val);
    if (this.textBoxName == "oddsVal") {
      if (keyValue == ".") {
        var dotCheck = oddsVal.indexOf(keyValue);
        if (dotCheck == 1) {
          return false;
        }
      }
      let newStr: string = oddsVal + keyValue;
      this.betForm.controls["oddsVal"].setValue(newStr);
    } else if (this.textBoxName == "stakeVal") {
      if (keyValue == ".") {
        var dotCheck = stakeVal.indexOf(keyValue);
        if (dotCheck == 1) {
          return false;
        }
      }
      let newStr: string = stakeVal + keyValue;
      this.betForm.controls["stakeVal"].setValue(newStr);
    }
    this.setTempProfitVal();
  }

  //Set Key Board Value
  keyboardBack() {
    if (this.textBoxName == "oddsVal") {
      let oldStr: string = String(this.betForm.controls["oddsVal"].value);
      let newStr: string = String(oldStr.substring(0, oldStr.length - 1));
      this.betForm.controls["oddsVal"].setValue(newStr);
    } else if (this.textBoxName == "stakeVal") {
      let oldStr: string = String(this.betForm.controls["stakeVal"].value);
      let newStr: string = String(oldStr.substring(0, oldStr.length - 1));
      this.betForm.controls["stakeVal"].setValue(newStr);
    }
    this.setTempProfitVal();
  }

  //Set Stack Value
  changeStake(val) {
    this.betForm.controls["stakeVal"].setValue(val);
    this.setTempProfitVal();
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
    this.setTempProfitVal();
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
    this.setTempProfitVal();
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
