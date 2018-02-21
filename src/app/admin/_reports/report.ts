import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AdminService, LibraryService } from "../../_services/index";
import { DatePickerOptions } from "ng2-datepicker";
import { MatSnackBar } from "@angular/material";
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarEventTitleFormatter
} from "angular-calendar";
import { CustomEventTitleFormatter } from "../../home/_reports/custom-event-title-formatter.provider";
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
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/modal-options.class";
import { LocalDataSource } from "ng2-smart-table";
const colors: any = {
  red: {}
};

@Component({
  selector: "admin-report",
  templateUrl: "./report.html",
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ]
})
export class AdminReportComponent implements OnInit {
  @Input() isCollapsedReport;
  public selectedValue: string;
  public reportForm: object;
  public allGames: any[];
  public allUsers: any[];
  public plReportForm: any;
  public plReport: any[] = [];
  public txnReport: any;
  public accountReport: any;
  public reportSettings: object;
  public betReport: LocalDataSource;
  public statusSettings: object;
  public statusReport: LocalDataSource;
  public balanceReport: any;
  public loading: boolean;
  public tabToggle: object;
  public plReportTotal: number;
  public transactionsReport: object;
  public accountStatementReport: object;
  public betsReport: object;
  public optionsFrom: DatePickerOptions;
  public optionsTo: DatePickerOptions;
  public modalRef: BsModalRef;
  public removeNext: boolean = false;
  @ViewChild("modalContent") modalContent: TemplateRef<any>;
  clickedDate;

  view: string = "month";
  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [];

  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = false;

  constructor(
    private adminService: AdminService,
    private libraryService: LibraryService,
    private snackBar: MatSnackBar,
    private sessionStore: SessionStorageService,
    private modalService: BsModalService
  ) {
    this.loading = false;
    this.betReport = new LocalDataSource();
    this.statusReport = new LocalDataSource();
    this.plReportTotal = 0;
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

    // Load Games
    this.adminService.getGamesNew().subscribe(data => {
      this.allGames = [
        {
          value: "",
          label: "All Games"
        }
      ];
      for (let itom in data.data.games) {
        this.allGames.push({
          value: data.data.games[itom].game_id,
          label: data.data.games[itom].game_name
        });
      }
    });

    // Load Users
    this.adminService.repUserlist().subscribe(data => {
      this.allUsers = [
        {
          value: "",
          label: "All Users"
        }
      ];
      for (let itom in data.data) {
        this.allUsers.push({
          value: data.data[itom].user_id,
          label: data.data[itom].username
        });
      }
    });

    this.plReportForm = new FormGroup({
      from: new FormControl(),
      fromBegining: new FormControl(),
      to: new FormControl(),
      tillNow: new FormControl(),
      uid: new FormControl(),
      gid: new FormControl(),
      rtype: new FormControl("pl"),
      txntype: new FormControl(0),
      game_type: new FormControl(1)
    });
    this.plReportForm.controls["gid"].setValue([""]);
    this.plReportForm.controls["uid"].setValue([""]);
    this.plReportForm.controls["game_type"].setValue("0");
    this.plReportForm.controls["txntype"].setValue("0");

    //Table Titles
    this.reportSettings = {
      actions: false,
      columns: {
        bettime: {
          type: "html",
          title: "Date",
          filter: false,
          sortDirection: "desc",
          valuePrepareFunction: (cell, row) => {
            return this.libraryService.formatDate(cell);
          }
        },
        username: {
          title: "User"
        },
        eventname: {
          title: "Event Name"
        },
        selname: {
          title: "Sel Name"
        },
        stake: {
          type: "html",
          title: "Amount",
          class: "wide",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${
              row.type == "l" || row.type == "No" ? "layColor" : "backColor"
            }">${cell}</div>`;
          }
        },
        odds: {
          type: "html",
          title: "Odds",
          class: "wide",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${
              row.type == "l" || row.type == "No" ? "layColor" : "backColor"
            }">${cell}</div>`;
          }
        }
      }
    };

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
            return `<div class="text-right ${
              row.balance >= 0 ? "positive" : "negative"
            }">${cell}</div>`;
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
            return `<div class="text-right ${
              row.pl >= 0 ? "positive" : "negative"
            }">${cell}</div>`;
          }
        },
        dw: {
          type: "html",
          title: "DW",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${
              row.dw >= 0 ? "positive" : "negative"
            }">${cell}</div>`;
          }
        }
      }
    };

    this.selectedValue = "";
  }

  loadReport() {
    if (this.selectedValue == "pl") {
      this.onSubmitReportPl("pl");
    } else if (this.selectedValue == "td") {
      this.onSubmitReportTxn("txn");
    } else if (this.selectedValue == "as") {
      this.onSubmitAccountReport(this.plReportForm.value);
    } else if (this.selectedValue == "credit_adjust") {
      this.onSubmitBalanceReport(this.plReportForm.value);
    } else if (this.selectedValue == "acst") {
      this.onSubmitStatusReport(this.plReportForm.value);
    }
  }

  ngOnChanges(changes) {
    if (changes && this.isCollapsedReport) {
      this.onSubmitReportPl("pl");
      this.selectedValue = "";
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

  handleEvent(action: string, event: CalendarEvent): void {
    // this.modalData = { event, action };
    console.log(event);
    console.log("sss");
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
    this.adminService.getPlReport(1, type, date).subscribe(data => {
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
              meta: [],
              actions: this.actions
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
    this.adminService.getPlReport(1, type, date).subscribe(data => {
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

  // Account Report
  onSubmitAccountReport(form) {
    if (form.uid == null) {
      form.uid = "";
    }
    if (form.gid == null) {
      form.gid = "";
    }
    form.from = -1;
    form.to = -1;
    form.rtype = "as";
    this.loading = true;
    this.adminService.getPlReportAll(form).subscribe(data => {
      if (data.status == 1) {
        // this.accountStatementReport = data.data.records;
        this.activeDayIsOpen = false;
        let tempObject: object = {};
        for (let item of data.data) {
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
        this.plReportTotal = data.data[0].balance;
        this.loading = false;
      } else {
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-danger"]
        });
        this.accountReport = {};
        this.loading = false;
      }
    });
  }

  // Bet Report
  onSubmitBetReport(form) {
    if (form.uid == null) {
      form.uid = "";
    }
    if (form.gid == null) {
      form.gid = "";
    }
    if (form.fromBegining) {
      form.from = -1;
    } else {
      form.from = form.from.formatted;
    }
    if (form.tillNow) {
      form.to = -1;
    } else {
      form.to = form.to.formatted;
    }
    form.rtype = "bets";
    this.loading = true;
    this.adminService.getPlReportAll(form).subscribe(data => {
      if (data.status == 1) {
        this.betReport.load(data.data);
        this.loading = false;
      } else {
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-danger"]
        });
        // this.betReport = {};
        this.loading = false;
      }
    });
  }

  // Account Status Report
  onSubmitStatusReport(form) {
    if (form.uid == null) {
      form.uid = "";
    }
    if (form.gid == null) {
      form.gid = "";
    }
    form.from = -1;

    // if (form.fromBegining) {   form.from = -1; } else {   form.from =
    // form.from.formatted; } if (form.tillNow) {
    form.to = -1;
    // } else { form.to = form.to.formatted; }
    form.rtype = "acst";
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

  // Balance Report
  onSubmitBalanceReport(form) {
    form.rtype = "credit_adjust";
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

        //Calc Different
        let userDetails = JSON.parse(
          this.sessionStore.retrieve("adminUserDetails")
        );
        if (tempData["Tcredit"] < tempData["Tdebit"]) {
          let diff = tempData["Tdebit"] - tempData["Tcredit"];
          tempData["Credit"].push({
            username: `${userDetails.data.name} (own (P/L + Commission))`,
            parent_id: 1,
            amount: Number(diff)
          });
          tempData["Tcredit"] = Number(tempData["Tcredit"]) + Number(diff);
        } else {
          let diff = tempData["Tcredit"] - tempData["Tdebit"];
          tempData["Debit"].push({
            username: `${userDetails.data.name} (own (P/L + Commission))`,
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
}
