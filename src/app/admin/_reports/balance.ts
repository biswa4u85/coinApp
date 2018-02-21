import { Component, Input, OnInit, AfterViewInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AdminService } from "../../_services/index";

import { Observable } from "rxjs/Observable";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { AdminComponent } from "../admin.component";
import { MatSnackBar } from "@angular/material";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";

@Component({ selector: "admin-balance", templateUrl: "./balance.html" })
export class AdminBalanceComponent implements OnInit {
  @Input() parentId;
  @Input() userId;
  @Input() type;
  public loading: boolean;
  public depositForm: FormGroup;
  public withdrawForm: FormGroup;
  public cashDepositList: any;
  public cashwithdrawList: any;
  public randerTemplate: boolean;
  public mod_withdraw;
  public selectedTab: number;

  constructor(
    private adminService: AdminService,
    private adminComponent: AdminComponent,
    public snackBar: MatSnackBar,
    private sessionStore: SessionStorageService
  ) {}

  public ngOnInit() {
    if (this.type == "withdraw") {
      this.selectedTab = 1;
    } else {
      this.selectedTab = 0;
    }

    //Deposit
    this.depositForm = new FormGroup({
      mod_user_deposit_amt: new FormControl("", Validators.required),
      mod_user_deposit_remark: new FormControl(),
      mod_user_cash_deposit: new FormControl("", Validators.required)
    });

    this.adminService.getChildCashUser(this.userId, 4).subscribe(data => {
      this.cashDepositList = [];
      this.cashDepositList.push({
        value: this.parentId,
        label: "Default Settlement A/c"
      });
      for (let itom in data.data) {
        this.cashDepositList.push({
          value: data.data[itom].user_id,
          label: data.data[itom].name + " (" + data.data[itom].username + ")"
        });
      }
      this.depositForm.controls["mod_user_cash_deposit"].setValue([
        String(this.parentId)
      ]);
    });

    //withdraw
    this.withdrawForm = new FormGroup({
      mod_user_withdraw_amt: new FormControl("", Validators.required),
      mod_user_withdral_remark: new FormControl(),
      mod_user_cash_withdraw: new FormControl("", Validators.required)
    });

    this.adminService.getChildCashUser(this.userId, 5).subscribe(data => {
      this.cashwithdrawList = [];
      this.cashwithdrawList.push({
        value: this.parentId,
        label: "Default Settlement A/c	"
      });
      for (let itom in data.data) {
        this.cashwithdrawList.push({
          value: data.data[itom].user_id,
          label: data.data[itom].name + " (" + data.data[itom].username + ")"
        });
      }
      this.depositForm.controls["mod_user_cash_deposit"].setValue([
        String(this.parentId)
      ]);
      this.mod_withdraw = String(this.parentId);
    });
  }

  //Deposit To Others Form
  onSubmitDepositForm(form) {
    this.loading = true;
    this.adminService.userDeposit(this.userId, form).subscribe(data => {
      if (data.status == 1) {
        this.snackBar.open("Successfully", undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
        setTimeout(() => {
          this.depositForm.reset();
          this.depositForm.controls["mod_user_cash_deposit"].setValue([
            this.parentId
          ]);
        }, 3000);
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

  //Withdraw From Others Form
  onSubmitWithdrawForm(form) {
    this.loading = true;
    this.adminService.userWithdraw(this.userId, form).subscribe(data => {
      if (data.status == 1) {
        this.snackBar.open("Successfully", undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
        setTimeout(() => {
          this.withdrawForm.reset();
          this.withdrawForm.controls["mod_user_cash_withdraw"].setValue([
            this.parentId
          ]);
        }, 3000);
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
}
