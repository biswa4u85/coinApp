import { Component, OnInit, Input } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HomeService, LibraryService } from "../../_services/index";
import { DatePickerOptions, DateModel } from "ng2-datepicker";
import { MatSnackBar } from "@angular/material";
import { HomeComponent } from "../home.component";
import {
  SharedGameDetails,
  MatchedUnmatchedBets,
  Bets
} from "../../_services/gamedetail.service";

import { Observable } from "rxjs/Observable";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { LocalDataSource } from "ng2-smart-table";

@Component({ selector: "app-mybets", templateUrl: "./mybets.html" })
export class MybetsComponent implements OnInit {
  @Input() myBetStatus;
  @Input() isCollapsedMyBets;
  public selectedValue: string;
  public settledBets: any[] = [];
  public settledBetsDtable: LocalDataSource;
  public settledForm: FormGroup;
  public loading: boolean;
  public MyMBets;
  public MyMBetsDtable: LocalDataSource;
  public tempMyMBets: any[] = [];
  public MyUBets: any[] = [];
  public MyUBetsDtable: LocalDataSource;
  public optionsFrom: DatePickerOptions;
  public optionsTo: DatePickerOptions;
  public tabToggle: object;
  public objectKeys = Object.keys;
  public intervalMBets: boolean;
  public intervalUBets: boolean;
  public matchUnmatchSettings: object;
  public consolidate: boolean = true;
  public updateMatchId: number = 0;
  public source: LocalDataSource;

  constructor(
    private homeService: HomeService,
    private libraryService: LibraryService,
    public snackBar: MatSnackBar,
    private homeComponent: HomeComponent,
    public sharedGameDetails: SharedGameDetails
  ) {
    this.MyMBetsDtable = new LocalDataSource();
    this.MyUBetsDtable = new LocalDataSource();
    this.settledBetsDtable = new LocalDataSource();
    this.loading = false;
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

  ngOnChanges(changes) {
    if (changes) {
      if (this.isCollapsedMyBets) {
        this.getMyMBets();
        this.getMyUBets();
        IntervalObservable.create(5000)
          .takeWhile(() => this.intervalMBets)
          .subscribe(() => {
            this.getMyMBets();
            this.getMyUBets();
          });
      } else {
        this.intervalMBets = false;
        this.intervalUBets = false;
      }
    }
  }

  ngOnInit() {
    this.tabToggle = {};
    this.tabToggle["matched"] = true;

    this.intervalMBets = true;
    this.intervalUBets = false;

    this.settledForm = new FormGroup({
      from: new FormControl("", Validators.required),
      to: new FormControl("", Validators.required)
    });

    //Table Titles
    this.matchUnmatchSettings = {
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
        eventname: {
          title: "Game"
        },
        selname: {
          title: "Team Name"
        },
        stake: {
          type: "html",
          title: "Amount",
          class: "wide",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${row.type == "l" || row.type == "No"
              ? "layColor"
              : "backColor"}">${cell}</div>`;
          }
        },
        odds: {
          type: "html",
          title: "Odds",
          class: "wide",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${row.type == "l" || row.type == "No"
              ? "layColor"
              : "backColor"}">${cell}</div>`;
          }
        }
      }
    };
  }

  openTabs(id) {
    this.tabToggle = {};
    this.tabToggle[id] = true;
  }

  // Get My M Bets Value
  getMyMBets() {
    this.homeService.getMyMBets(this.updateMatchId).subscribe(data => {
      if (data.data.length != 0) {
        for (let item of data.data) {
          this.tempMyMBets.push(item);
          if (!this.consolidate) {
            this.MyMBetsDtable.prepend(item);
          }
          if (item.bet_id > this.updateMatchId) {
            this.updateMatchId = item.bet_id;
          }
        }

        // Check Consolidate
        if (this.consolidate) {
          this.MyMBetsDtable.reset();
          this.MyMBetsDtable.load(
            this.libraryService.consolidateBets(this.tempMyMBets)
          );
        }

        this.MyMBets = this.MyMBetsDtable.count();
      }
    });
  }

  checkConsolidate() {
    this.MyMBetsDtable.reset();
    if (this.consolidate) {
      this.MyMBetsDtable.load(this.tempMyMBets);
    } else {
      this.MyMBetsDtable.load(
        this.libraryService.consolidateBets(this.tempMyMBets)
      );
    }

    this.MyMBets = this.MyMBetsDtable.count();
  }

  // Get My U Bets Value
  getMyUBets() {
    this.homeService.getMyUBets().subscribe(data => {
      //Add Item
      for (let item of data.data) {
        if (this.MyUBets.includes(item) === false) {
          this.MyUBets.push(item);
          this.MyUBetsDtable.prepend(item);
        }
      }

      //Remove Item
      for (let item of this.MyUBets) {
        if (data.data.includes(item) === false) {
          this.MyUBets.splice(this.MyUBets.indexOf(item), 1);
          this.MyUBetsDtable.remove(item);
        }
      }
    });
  }

  trackByBetId(index, item) {
    return item.bet_id;
  }

  cancelBets(bid: number) {
    this.homeService.cancelBet(bid).subscribe(data => {
      if (data.status == 1) {
        this.sharedGameDetails.CancelBet(data.game_id, data.bet_id);
      }
    });
  }

  onSubmitBetsReport(form) {
    this.loading = true;
    this.homeService
      .getBetsReport(form.from.formatted, form.to.formatted, "3")
      .subscribe(data => {
        if (data.status == 1) {
          this.settledBets = data.data;
          this.settledBetsDtable.load(data.data);
          this.loading = false;
        } else {
          this.snackBar.open(data.error, undefined, {
            duration: 300000,
            extraClasses: ["alert-danger"]
          });
          this.settledBets = [];
          this.loading = false;
        }
      });
  }
}
