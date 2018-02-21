import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HomeService } from "../../_services/index";
import { DatePickerOptions } from "ng2-datepicker";
import { MatSnackBar } from "@angular/material";
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarEventTitleFormatter
} from "angular-calendar";
import { CustomEventTitleFormatter } from "./custom-event-title-formatter.provider";
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
const colors: any = { red: {} };

@Component({
  selector: "app-report",
  templateUrl: "./report.html",
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ]
})
export class ReportComponent implements OnInit {
  @Input() isCollapsedReport;
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
  public day;
  @ViewChild("modalContent") modalContent: TemplateRef<any>;
  clickedDate;

  view: string = "month";
  viewDate: Date = new Date();

  modalData: { event: CalendarEvent };
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = false;

  constructor(private homeService: HomeService, public snackBar: MatSnackBar) {
    this.loading = false;
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

  ngOnInit() {
    this.viewDate;
    this.tabToggle = {};
    this.tabToggle["profitLoss"] = true;

    this.reportForm = new FormGroup({
      from: new FormControl(),
      to: new FormControl()
    });
  }

  ngOnChanges(changes) {
    if (changes && this.isCollapsedReport) {
      this.onSubmitReportPl("pl");
      this.tabToggle = {};
      this.tabToggle["profitLoss"] = true;
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

  //Single Report Pl213
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
    this.homeService.getPlReport(1, type, date).subscribe(data => {
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
    this.homeService.getPlReport(1, type, date).subscribe(data => {
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
    var myVariable = new Date(this.viewDate.setDate(1));
    var makeDate = new Date(myVariable.setHours(0, 0, 0, 0));
    if (type == "pl") {
      this.onSubmitReportPl(type, makeDate);
    } else {
      this.onSubmitReportTxn(type, makeDate);
    }
  }

  // Account Statement
  onSubmitAccountStatementReport(form?) {
    this.loading = true;
    this.homeService.reportPl("-1", "-1", "0", "as_touch").subscribe(data => {
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
}
