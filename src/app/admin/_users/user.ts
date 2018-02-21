import { Component, Input, OnInit, TemplateRef } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AdminService, LibraryService, } from "../../_services/index";

import { Observable } from "rxjs/Observable";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { AdminComponent } from "../admin.component";
import { MatSnackBar } from "@angular/material";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/modal-options.class";

@Component({ selector: "admin-user", templateUrl: "./user.html" })
export class UserComponent implements OnInit {
  @Input() userIds: object;
  @Input() currentUserId: number;
  public currentUser: any;
  public name: string;
  public status: string;
  public type: number;
  public userInfo: any;
  public loading: boolean;
  public loadingNew: boolean;
  public newDealerForm: any;
  public newUserForm: any;
  public newCashForm: any;
  public editUserForm: any;
  public getUserData: any;
  public crediInForm: any;
  public divideForm: any;
  public depositForm: any;
  public withdrawForm: any;
  public cashDepositList: any;
  public cashUserList: any;
  public cashUserDetailsId: number = null
  public cashUserDetails: any;
  public cashwithdrawList: any;
  public settingsForm: any;
  public allGames: any;
  public allOptions: any;
  public suspendStatus: boolean;
  public selectedValueNew: string;
  public selectedValueBalance: string;
  public selectedValueTransaction: string;
  public getAccess: boolean = false;
  public parentUser: string = "";
  public inhDesible: boolean = false;
  public selectedTab: number = 0;
  public modalRef: BsModalRef;
  public modSettingsVal: string;
  public modSettingsValInh: string;

  constructor(
    private modalService: BsModalService,
    private adminService: AdminService,
    private libraryService: LibraryService,
    private adminComponent: AdminComponent,
    public snackBar: MatSnackBar,
    private sessionStore: SessionStorageService
  ) { }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  public ngOnInit() {
    let userDetails = JSON.parse(
      this.sessionStore.retrieve("adminUserDetails")
    );
    if (userDetails.data.type == 3) {
      this.getAccess = true;
    }

    this.currentUser = this.userIds[this.currentUserId];
    if (this.currentUser.parent_root) {
      this.parentUser = this.currentUser.parent_root;
    }

    this.currentUserInfo();
    this.selectedValueBalance = "crediIn";
    this.selectedValueTransaction = "deposit";

    //New Deler
    let self = this;
    this.newDealerForm = new FormGroup({
      mod_newdealer_name: new FormControl("", Validators.required),
      mod_newdealer_uname: new FormControl("", Validators.required),
      mod_newdealer_pwd: new FormControl("", Validators.required),
      mod_newdealer_share: new FormControl("0", Validators.required)
    });

    //New Player
    this.newUserForm = new FormGroup({
      mod_newdealer_type: new FormControl("1"),
      mod_newdealer_name: new FormControl("", Validators.required),
      mod_newdealer_uname: new FormControl("", Validators.required),
      mod_newdealer_pwd: new FormControl("", Validators.required),
      mod_newdealer_share: new FormControl("100", Validators.required)
    });

    //New Cash User
    this.newCashForm = new FormGroup({
      cash_user_name: new FormControl("", Validators.required)
    });

    //Edit User
    this.editUserForm = new FormGroup({
      mod_newdealer_pwd: new FormControl(""),
      mod_newdealer_share: new FormControl("", Validators.required)
    });

    //Credit
    this.crediInForm = new FormGroup({
      mod_user_deposit_amt: new FormControl("", Validators.required),
      mod_user_deposit_remark: new FormControl()
    });

    //Devid
    this.divideForm = new FormGroup({
      mod_user_withdraw_amt: new FormControl("", Validators.required),
      mod_user_withdral_remark: new FormControl()
    });

    //withdraw
    this.withdrawForm = new FormGroup({
      mod_user_withdraw_amt: new FormControl("", Validators.required),
      mod_user_withdral_remark: new FormControl(),
      mod_user_cash_withdraw: new FormControl("", Validators.required)
    });

    //deposit
    this.depositForm = new FormGroup({
      mod_user_deposit_amt: new FormControl("", Validators.required),
      mod_user_deposit_remark: new FormControl(),
      mod_user_cash_deposit: new FormControl("", Validators.required)
    });

    //Setting
    this.settingsForm = new FormGroup({
      mod_settings_opt: new FormControl(["wincom"], Validators.required),
      mod_settings_gid: new FormControl("", Validators.required),
      mod_settings_inh: new FormControl("", Validators.required),
      mod_settings_val: new FormControl("", Validators.required)
    });

    this.cashUserListLoad();
  }

  onLinkClick($event: any) {
    if ($event === 2) {
      this.settingFormLoad();
    } else if ($event === 3) {
      this.transactionEvent();
    }
  }

  transactionEvent() {
    if (this.selectedValueTransaction == "deposit") {
      this.depositFormLoad();
    } else if (this.selectedValueTransaction == "withdraw") {
      this.withdrawFormLoad();
    }
  }

  depositFormLoad() {
    this.adminService
      .getChildCashUser(this.currentUserId, 4)
      .subscribe(data => {
        this.cashDepositList = [];
        this.cashDepositList.push({
          value: this.userInfo.parent_id,
          label: "Default"
        });
        for (let itom in data.data) {
          this.cashDepositList.push({
            value: data.data[itom].user_id,
            label: data.data[itom].name + " (" + data.data[itom].username + ")"
          });
        }

        this.depositForm.controls["mod_user_cash_deposit"].setValue([
          String(this.userInfo.parent_id)
        ]);
      });
  }

  cashUserListLoad() {
    this.adminService
      .getChildCashUser(this.currentUserId, 4)
      .subscribe(data => {
        this.cashUserList = data.data;
      });
  }

  cashUserListDetails(id) {
    this.cashUserDetailsId = id
    this.cashUserDetails = []
    let tempAnount = 0
    this.adminService
      .repCashPlReport(id)
      .subscribe(data => {
        for (let item of data.data) {
          item['txn_time'] = this.libraryService.formatDate(item.txn_time)
          item['con_amount'] = tempAnount + item.amount
          tempAnount = item.con_amount
          this.cashUserDetails.push(item)
        }
      });
  }

  withdrawFormLoad() {
    this.adminService
      .getChildCashUser(this.currentUserId, 5)
      .subscribe(data => {
        this.cashwithdrawList = [];
        this.cashwithdrawList.push({
          value: this.userInfo.parent_id,
          label: "Default"
        });
        for (let itom in data.data) {
          this.cashwithdrawList.push({
            value: data.data[itom].user_id,
            label: data.data[itom].name + " (" + data.data[itom].username + ")"
          });
        }

        this.withdrawForm.controls["mod_user_cash_withdraw"].setValue([
          String(this.userInfo.parent_id)
        ]);
      });
  }

  changeInhDesible() {
    if (this.inhDesible) {
      this.inhDesible = false;
      this.settingsForm.controls["mod_settings_val"].setValue(
        this.modSettingsVal
      );
    } else {
      this.inhDesible = true;
      this.settingsForm.controls["mod_settings_val"].setValue(
        this.modSettingsValInh
      );
    }
  }

  settingFormLoad() {
    this.adminService.getSettingGames().subscribe(data => {
      this.allGames = [
        {
          value: -1,
          label: "All Games"
        }
      ];
      for (let itom in data.data.games) {
        this.allGames.push({
          value: data.data.games[itom].game_id,
          label: data.data.games[itom].game_name
        });
      }

      this.allOptions = [
        {
          value: "wincom",
          label: "Winning Commission"
        },
        {
          value: "min_stake",
          label: "Min stake"
        },
        {
          value: "max_stake",
          label: "Max stake"
        },
        {
          value: "max_profit",
          label: "Max profit"
        },
        {
          value: "before_inplay",
          label: "Before inplay profit"
        },
        {
          value: "bet_delay",
          label: "Bet delay"
        },
        {
          value: "match_amt",
          label: "Match stake"
        },
        {
          value: "multiple_vol",
          label: "Multiple volume"
        },
        {
          value: "ticker",
          label: "Boradcast Message"
        },
        {
          value: "unmatched_bets",
          label: "Unmatched Bets"
        },
        {
          value: "system_status",
          label: "Lock Bets"
        }
      ];

      // TODO::Set Defult Value Set Value
      let form = {
        mod_settings_gid: "-1",
        mod_settings_opt: "wincom"
      };
      this.adminService
        .getSettings(this.userInfo.user_id, form)
        .subscribe(data => {
          this.settingsForm.controls["mod_settings_gid"].setValue([-1]);
          this.settingsForm.controls["mod_settings_opt"].setValue(["wincom"]);
          this.settingsForm.controls["mod_settings_inh"].setValue(
            data.data.inh
          );
          this.settingsForm.controls["mod_settings_val"].setValue(
            String(data.data.value)
          );
          this.modSettingsVal = String(data.data.value);
          this.modSettingsValInh = String(data.data.inh_value);
          if (data.data.inh) {
            this.inhDesible = true;
          }
        });
    });
  }

  editUserFormLoad() {
    this.adminService.getUser(this.currentUserId).subscribe(data => {
      if (data.status == 1) {
        this.getUserData = data.data;

        //Check Player
        if (this.type == 1) {
          this.selectedValueNew = "edit";
        } else {
          this.selectedValueNew = "";
        }
        this.editUserForm.controls["mod_newdealer_share"].setValue(
          this.getUserData.percent
        );
      }
    });
  }

  closeUser() {
    delete this.userIds[this.currentUserId];
  }

  currentUserInfo() {
    this.adminService.getUserinfo(this.currentUserId).subscribe(data => {
      this.userInfo = data.data;
      this.status = this.userInfo.status;
      this.name = this.userInfo.username;
      this.type = this.userInfo.type;
      if (this.status == "0") {
        this.suspendStatus = true;
      } else {
        this.suspendStatus = false;
      }

      //Load Edit User From
      this.editUserFormLoad();
    });
  }

  suspend() {
    this.adminService.suspendActive(this.currentUserId).subscribe(data => {
      this.currentUserInfo();
    });
  }

  //New Cash Form
  onSubmitnewCashForm(form) {
    this.loading = true;
    this.adminService
      .newCashUser(this.userInfo.user_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          setTimeout(() => {
            // this.adminComponent.getUsers();
            this.selectedValueNew = "";
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

  //New Dealer Form
  onSubmitNewDealerForm(form) {
    if (this.userInfo.default_percent != null) {
      form.mod_newdealer_share = this.userInfo.default_percent;
    }
    this.loading = true;
    this.adminService.newDealer(this.userInfo.user_id, form).subscribe(data => {
      if (data.status == 1) {
        this.snackBar.open("Successfully", undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
        setTimeout(() => {
          this.adminComponent.getUsers();
          this.selectedValueNew = "";
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

  //New User Form
  onSubmitNewUserForm(form) {
    this.loading = true;
    this.adminService.newUser(this.userInfo.user_id, form).subscribe(data => {
      if (data.status == 1) {
        this.snackBar.open("Successfully", undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
        setTimeout(() => {
          this.adminComponent.getUsers();
          this.selectedValueNew = "";
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

  //Edit User Form
  onSubmitEditUserForm(form) {
    this.loading = true;
    this.adminService.editUser(this.userInfo.user_id, form).subscribe(data => {
      if (data.status == 1) {
        this.snackBar.open("Successfully", undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
        this.currentUserInfo();
        setTimeout(() => {
          this.adminComponent.getUsers();
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

  //Credit In Form
  onSubmitCrediInForm(form) {
    this.loading = true;
    this.adminService.creditIn(this.userInfo.user_id, form).subscribe(data => {
      if (data.status == 1) {
        this.snackBar.open("Successfully", undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
        this.currentUserInfo();
        setTimeout(() => {
          this.crediInForm.reset();
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

  //Divide Form
  onSubmitDivideForm(form) {
    this.loading = true;
    this.adminService.creditOut(this.userInfo.user_id, form).subscribe(data => {
      if (data.status == 1) {
        this.snackBar.open("Successfully", undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });

        setTimeout(() => {
          this.currentUserInfo();
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

  //Deposit To Others Form
  onSubmitDepositForm(form) {
    this.loading = true;
    this.adminService
      .userDeposit(this.userInfo.user_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.currentUserInfo();
          setTimeout(() => {
            this.depositForm.reset();
            this.depositForm.controls["mod_user_cash_deposit"].setValue([
              this.userInfo.parent_id
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
    this.adminService
      .userWithdraw(this.userInfo.user_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.currentUserInfo();
          setTimeout(() => {
            this.withdrawForm.reset();
            this.withdrawForm.controls["mod_user_cash_withdraw"].setValue([
              this.userInfo.parent_id
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

  //Change Setting Form
  changeSettingsForm(form) {
    if (typeof form.mod_settings_opt == "object") {
      form.mod_settings_opt = form.mod_settings_opt[0];
    }
    if (typeof form.mod_settings_gid == "object") {
      form.mod_settings_gid = form.mod_settings_gid[0];
    }
    this.loadingNew = true;
    this.adminService
      .getSettings(this.userInfo.user_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.settingsForm.controls["mod_settings_inh"].setValue(
            data.data.inh
          );
          this.settingsForm.controls["mod_settings_val"].setValue(
            String(data.data.value)
          );
          this.modSettingsVal = String(data.data.value);
          this.modSettingsValInh = String(data.data.inh_value);
          this.loadingNew = false;
        } else {
          this.loadingNew = false;
        }
      });
  }

  //Save Setting Form
  onSubmitSettingsForm(form) {
    if (typeof form.mod_settings_opt == "object") {
      form.mod_settings_opt = form.mod_settings_opt[0];
    }
    if (typeof form.mod_settings_gid == "object") {
      form.mod_settings_gid = form.mod_settings_gid[0];
    }
    this.loading = true;
    this.adminService
      .saveSettings(this.userInfo.user_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.currentUserInfo();
          setTimeout(() => {
            // this.selectedValue = '';
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

  openTab(tabId, selId) {
    this.selectedTab = tabId;
    this.selectedValueTransaction = selId;
  }
}
