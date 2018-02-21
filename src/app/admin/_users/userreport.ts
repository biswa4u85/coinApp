import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AdminService } from "../../_services/index";
import { DatePickerOptions } from "ng2-datepicker";
import { MatSnackBar } from "@angular/material";
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarEventTitleFormatter
} from "angular-calendar";
import { CustomEventTitleFormatter } from "../../home/_reports/custom-event-title-formatter.provider";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { BsModalRef } from "ngx-bootstrap/modal/modal-options.class";
import { BsModalService } from "ngx-bootstrap/modal";
import { LocalDataSource } from "ng2-smart-table";

import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from "date-fns";
import { Subject } from "rxjs/Subject";
const colors: any = {
  red: {}
};

@Component({
  selector: "app-userreport",
  templateUrl: "./userreport.html",
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ]
})
export class UserReportComponent implements OnInit {
  @Input() isCollapsedReport;
  @Input() uid;
  @Input() uname;
  public selectedValue: string;
  public reportForm: object;
  public loading: boolean;
  public tabToggle: object;
  public plReportTotal: number;
  public transactionsReport: object;
  public accountStatementReport: object;
  public betsReport: object;
  public optionsFrom: DatePickerOptions;
  public optionsTo: DatePickerOptions;
  public removeNext: boolean = false;
  public balanceReport: any;
  public modalRef: BsModalRef;
  public statusSettings: object;
  public statusReport: LocalDataSource;
  @ViewChild("modalContent") modalContent: TemplateRef<any>;
  clickedDate;

  view: string = "month";
  viewDate: Date = new Date();

  modalData: {
    event: CalendarEvent;
  };
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = false;

  constructor(
    private adminService: AdminService,
    private sessionStore: SessionStorageService,
    public snackBar: MatSnackBar,
    private modalService: BsModalService
  ) {
    this.loading = false;
    this.plReportTotal = 0;
    this.statusReport = new LocalDataSource();
    let date = new Date();
    date.setDate(date.getDate() - 7);
    this.optionsFrom = {
      format: "YYYY-MM-DD",
      initialDate: date
    };
    this.optionsTo = {
      format: "YYYY-MM-DD",
      initialDate: new Date()
    };
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  ngOnInit() {
    this.viewDate.setDate(1);
    this.tabToggle = {};
    this.tabToggle["profitLoss"] = true;
    this.onSubmitReportPl("pl");

    this.reportForm = new FormGroup({
      from: new FormControl(),
      to: new FormControl()
    });

    this.statusSettings = {
      actions: false,
      columns: {
        user_name: {
          title: "User Name"
        },
        balance: {
          type: "html",
          title: "Balance",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${row.balance >= 0
              ? "positive"
              : "negative"}">${cell}</div>`;
          }
        },
        exposure: {
          type: "html",
          title: "Exposure",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right">${cell}</div>`;
          }
        },
        pl: {
          type: "html",
          title: "PL",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${row.pl >= 0
              ? "positive"
              : "negative"}">${cell}</div>`;
          }
        },
        dw: {
          type: "html",
          title: "DW",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${row.dw >= 0
              ? "positive"
              : "negative"}">${cell}</div>`;
          }
        }
      }
    };
  }

  ngOnChanges(changes) {
    if (changes && this.isCollapsedReport) {
      this.onSubmitReportPl("pl");
    }
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  openTabs(id) {
    this.tabToggle = {};
    this.tabToggle[id] = true;
  }

  //Single Report Pl
  onSubmitReportPl(type, date?) {
    if (!date) {
      date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    } else {
      date = date;
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }
    this.loading = true;
    this.adminService
      .userGetPlReport(1, type, date, this.uid)
      .subscribe(data => {
        if (data.status == 1) {
          this.activeDayIsOpen = false;
          let tempObject: object = {};
          for (let item of data.data) {
            let newDate = new Date(item.dt + " UTC");
            let date = new Date(item.dt + " UTC").getDate();
            if (date in tempObject) {
              tempObject[date].title =
                Number(tempObject[date].title) + Number(item.nett);
              tempObject[date].meta.push(item);
            } else {
              tempObject[date] = {
                start: new Date(newDate),
                title: 0,
                color: colors.red,
                cssClass: "pl",
                meta: []
              };
              tempObject[date].title =
                Number(tempObject[date].title) + Number(item.nett);
              tempObject[date].meta.push(item);
            }
          }
          this.events = [];
          this.plReportTotal = 0;
          for (let item in tempObject) {
            this.events.push(tempObject[item]);
            this.plReportTotal =
              this.plReportTotal + Number(tempObject[item].title);
          }
          this.loading = false;
        } else {
          this.snackBar.open(data.error, undefined, {
            duration: 3000,
            extraClasses: ["alert-danger"]
          });
          this.plReportTotal = 0;
          this.loading = false;
        }
      });
  }

  //Single Report Txn
  onSubmitReportTxn(type, date?) {
    if (!date) {
      date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    } else {
      date = date;
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }
    this.loading = true;
    this.adminService
      .userGetPlReport(1, type, date, this.uid)
      .subscribe(data => {
        if (data.status == 1) {
          this.activeDayIsOpen = false;
          let tempObject: object = {};
          for (let item of data.data) {
            let newDate = new Date(item.dt + " UTC");
            let date = new Date(item.dt + " UTC").getDate();
            if (date in tempObject) {
              tempObject[date].title =
                Number(tempObject[date].title) + Number(item.amount);
              tempObject[date].meta.push(item);
            } else {
              tempObject[date] = {
                start: new Date(newDate),
                title: 0,
                color: colors.red,
                cssClass: "txn",
                meta: []
              };
              tempObject[date].title =
                Number(tempObject[date].title) + Number(item.amount);
              tempObject[date].meta.push(item);
            }
          }
          this.events = [];
          this.plReportTotal = 0;
          for (let item in tempObject) {
            this.events.push(tempObject[item]);
            this.plReportTotal =
              this.plReportTotal + Number(tempObject[item].title);
          }

          this.loading = false;
        } else {
          this.snackBar.open(data.error, undefined, {
            duration: 3000,
            extraClasses: ["alert-danger"]
          });
          this.plReportTotal = 0;
          this.loading = false;
        }
      });
  }

  onSubmitReportPlNextPre(type) {
    var currentDate = new Date().setHours(0, 0, 0, 0);
    var compareDate = new Date(this.viewDate).setHours(0, 0, 0, 0);
    if (currentDate != compareDate) {
      this.removeNext = true;
    } else {
      this.removeNext = false;
    }
    if (type == "pl") {
      this.onSubmitReportPl(type, this.viewDate);
    } else {
      this.onSubmitReportTxn(type, this.viewDate);
    }
  }

  // Account Statement
  onSubmitAccountStatementReport(form?) {
    this.loading = true;
    this.adminService
      .userReportPl("-1", "-1", this.uid, "as_touch")
      .subscribe(data => {
        if (data.status == 1) {
          // this.accountStatementReport = data.data.records;
          this.activeDayIsOpen = false;
          let tempObject: object = {};
          for (let item of data.data.records) {
            item.balance = Number(Number(item.balance).toFixed(2));
            let newDate = new Date(item.date + " UTC");
            let date = new Date(item.date + " UTC").getDate();
            if (date in tempObject) {
              tempObject[date].meta.push(item);
            } else {
              tempObject[date] = {
                start: new Date(newDate),
                title: 0,
                color: colors.red,
                cssClass: "account_statement",
                meta: []
              };
              tempObject[date].meta.push(item);
            }
          }

          for (let date in tempObject) {
            let dateWiseRows = tempObject[date];
            let metaLength = tempObject[date].meta.length;
            dateWiseRows.title = tempObject[date].meta[0].balance;
            tempObject[date].meta.reverse();
          }

          let opening: number = null;
          let closing: number = null;
          for (let date in tempObject) {
            if (closing) {
              let currentDateStart = new Date(
                tempObject[date].meta[0].date + " UTC"
              ).setHours(0, 0, 0, 0);
              tempObject[date].meta.unshift({
                date: currentDateStart,
                desc: "OPENING",
                balance: closing,
                debit: 0,
                credit: 0
              });
            } else {
              let currentDateStart = new Date(
                tempObject[date].meta[0].date + " UTC"
              ).setHours(0, 0, 0, 0);
              tempObject[date].meta.unshift({
                date: currentDateStart,
                desc: "OPENING",
                balance: "0",
                debit: 0,
                credit: 0
              });
            }
            let metaLength = tempObject[date].meta.length;
            closing = tempObject[date].meta[metaLength - 1].balance;
          }

          this.events = [];
          this.plReportTotal = 0;
          for (let item in tempObject) {
            this.events.push(tempObject[item]);
          }
          this.plReportTotal = data.data.records[0].balance;
          this.loading = false;
        } else {
          this.snackBar.open(data.error, undefined, {
            duration: 3000,
            extraClasses: ["alert-danger"]
          });
          this.accountStatementReport = [];
          this.loading = false;
        }
      });
  }

  // Balance Report
  onSubmitBalanceReport(form?) {
    if (!form) {
      form = {
        rtype: "credit_adjust",
        suid: this.uid
      };
    }
    this.loading = true;
    this.adminService.getPlReportAll(form).subscribe(data => {
      if (data.status == 1) {
        let tempData: object = {
          Credit: [],
          Debit: [],
          Tcredit: 0,
          Tdebit: 0,
          totalCal: ""
        };
        for (let item of data.data) {
          if (item.amount > 0) {
            tempData["Credit"].push(item);

            // Tcredit
            tempData["Tcredit"] =
              Number(tempData["Tcredit"]) + Number(item.amount);
          } else if (item.amount < 0) {
            item.amount = -1 * item.amount;
            tempData["Debit"].push(item);

            // Tdebit
            tempData["Tdebit"] =
              Number(tempData["Tdebit"]) + Number(item.amount);
          }
        }

        // Calc Different let userDetails =
        // JSON.parse(this.sessionStore.retrieve('adminUserDetails'));
        if (tempData["Tcredit"] < tempData["Tdebit"]) {
          let diff = tempData["Tdebit"] - tempData["Tcredit"];
          tempData["Credit"].push({
            username: `${this.uname} (own (P/L + Commission))`,
            parent_id: 1,
            amount: Number(diff)
          });
          tempData["Tcredit"] = Number(tempData["Tcredit"]) + Number(diff);
        } else {
          let diff = tempData["Tcredit"] - tempData["Tdebit"];
          tempData["Debit"].push({
            username: `${this.uname} (own (P/L + Commission))`,
            parent_id: 1,
            amount: Number(diff)
          });
          tempData["Tdebit"] = Number(tempData["Tdebit"]) + Number(diff);
        }

        //Total Cal Count
        if (tempData["Credit"].length > tempData["Debit"].length) {
          tempData["totalCal"] = "Credit";
        } else {
          tempData["totalCal"] = "Debit";
        }

        this.balanceReport = tempData;
        this.loading = false;
      } else {
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-danger"]
        });
        this.balanceReport = {};
        this.loading = false;
      }
    });
  }

  // Account Status Report
  onSubmitStatusReport(form?) {
    if (!form) {
      form = {
        rtype: "acst",
        suid: this.uid,
        gid: "",
        uid: "",
        from: -1,
        to: -1
      };
    }
    this.loading = true;
    this.adminService.getPlReportAll(form).subscribe(data => {
      if (data.status == 1) {
        this.statusReport.load(data.data);
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
