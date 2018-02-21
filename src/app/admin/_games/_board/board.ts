import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { LibraryService, BoardService } from "../../../_services/index";
import { DragScroll } from "angular2-drag-scroll";

import { Observable } from "rxjs/Observable";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";

@Component({
  selector: "app-board",
  templateUrl: "./board.html",
  styleUrls: ["./board.scss"]
})
export class BoardAdminComponent implements OnInit {
  @ViewChild("nav", { read: DragScroll })
  ds: DragScroll;
  public boardDetails: any;
  public defaultVal: number;
  public deveceDet: any;
  public title: string;
  public resultVal: boolean;
  public readOnlyItom: boolean;
  public splitItom: boolean;
  public enableEdit: string;
  public evenItom: boolean;
  public enableEditEven: string;
  public stopAll: boolean;
  public stopItom: boolean;
  public sItom: boolean;
  public bItom: boolean;
  public mainItom: boolean;
  public subItom: boolean;
  public splitValOnly: string;
  public splits: any;
  public splitVal: string;
  public evens: any;
  public evensVal: string;
  public touchs: any;
  public touchsVal: number;
  public mainVal: number;
  public itemsLeft: any;
  public topIndex: number;
  public itemsRight: any;
  public subVal: any;
  public success: string;
  public error: string;
  public status: number;
  public passwordForm: any;
  public loading: boolean;
  public leftNavDisabled = false;
  public rightNavDisabled = false;

  constructor(
    private boardService: BoardService,
    private libraryService: LibraryService
  ) {
    this.boardDetails = JSON.parse(localStorage.getItem("boardDet"));
    this.defaultVal = 50;
    this.deveceDet = JSON.parse(localStorage.getItem("deveceDet"));
  }

  ngOnInit() {
    this.loading = false;
    this.passwordForm = new FormGroup({
      runName: new FormControl("", Validators.required),
      passWord: new FormControl()
    });

    this.title =
      this.boardDetails.game_name + " > " + this.boardDetails.market_name;

    //Get Socket Data
    this.boardService.subscribeOdds(this.boardDetails.game_id);
    this.boardService.getSocketOdds().subscribe(data => {
      this.libraryService.showSocketData(data);
    });

    // Check Token And Game
    this.boardService
      .checkGameActive(this.boardDetails.game_id)
      .subscribe(data => {
        if (data.status != 1) {
          this.resultVal = true;
        }
      });

    //Disabled All
    this.stopAll = false;
    this.stopItom = true;

    //Readonly Itom
    this.sItom = false;
    this.mainItom = true;
    this.subItom = true;

    //Splite
    this.splitValOnly = null;

    //Splite Itom
    if (!localStorage.getItem("spliteVal")) {
      localStorage.setItem(
        "spliteVal",
        JSON.stringify(["90/110", "85/115", "75/125", "150/250", "200/250"])
      );
    }

    let spliteVal = JSON.parse(localStorage.getItem("spliteVal"));
    this.splits = spliteVal;
    this.splitVal = null;

    //Even
    if (!localStorage.getItem("evensVal")) {
      localStorage.setItem(
        "evensVal",
        JSON.stringify(["90/110", "85/115", "75/125", "150/250", "200/250"])
      );
    }

    let evensVal = JSON.parse(localStorage.getItem("evensVal"));
    this.evens = evensVal;
    this.evensVal = null;

    this.readOnlyItom = true;

    this.splitItom = true;
    this.enableEdit = "E";

    this.evenItom = true;
    this.enableEditEven = "E";

    //Touch
    this.touchs = [
      {
        id: "dotball",
        val: "."
      },
      {
        id: "onerun",
        val: "1"
      },
      {
        id: "tworun",
        val: "2"
      },
      {
        id: "threerun",
        val: "3"
      },
      {
        id: "fourrun",
        val: "4"
      },
      {
        id: "fiverun",
        val: "5"
      },
      {
        id: "sixrun",
        val: "6"
      },
      {
        id: "wideball",
        val: "WD"
      },
      {
        id: "noball",
        val: "NO"
      },
      {
        id: "wicket",
        val: "WC"
      },
      {
        id: "thirdumpire",
        val: "TU"
      }
    ];

    this.touchsVal = null;

    //Center value
    this.mainVal = this.defaultVal;

    //Left Itoms
    this.itemsLeft = [];
    for (var i = 0; i < 1000; i += 2) {
      this.itemsLeft.push([i, i + 1]);
    }
    this.topIndex = 21;

    //Right Itoms
    this.itemsRight = [];
    for (var i = this.mainVal + 1; i < 10000; i += 2) {
      this.itemsRight.push([i, i + 1]);
    }
  }

  moveLeft() {
    this.ds.moveLeft();
  }

  moveRight() {
    this.ds.moveRight();
  }

  leftBoundStat(reachesLeftBound: boolean) {
    this.leftNavDisabled = reachesLeftBound;
  }

  rightBoundStat(reachesRightBound: boolean) {
    this.rightNavDisabled = reachesRightBound;
  }

  ///only for board number change Left Click
  chnageFinalValboard(val) {
    this.mainItom = false;
    this.mainVal = val;
    this.itemsRight = [];
    for (var i = val + 1; i < 1000; i += 2) {
      this.itemsRight.push([i, i + 1]);
    }
    var enen;
    if (this.mainVal % 2 == 1) {
      enen = this.mainVal + 1;
    } else {
      enen = this.mainVal;
    }
    this.topIndex = enen / 2 - 4;
  }

  getFinalValboard(val) {
    this.mainItom = false;
    var totalVal;
    if (this.splitVal == null && this.evensVal == null) {
      totalVal = val;
    } else if (this.splitValOnly == null && this.splitVal != null) {
      this.subVal = this.splitVal.replace("/", ".");
      totalVal = val + "." + this.subVal;
    } else if (this.splitValOnly != null && this.splitVal != null) {
      this.subVal = this.splitVal.replace("/", "-");
      let totalVal = val + "." + this.subVal;
    } else if (this.evensVal != null) {
      if (this.evensVal == "Even") {
        let totalVal = val + "*";
      } else {
        this.subVal = this.evensVal.replace("/", ".");
        let totalVal = val + "*" + this.subVal;
      }
    }
  }

  getResult(form, val) {
    this.loading = true;
    this.boardService
      .saveResultSession(
        this.boardDetails.game_id,
        val,
        form.runName,
        form.password
      )
      .subscribe(data => {
        if (data.status == 1) {
          this.success = data.error;
          this.loading = false;
          setTimeout(() => {
            this.success = "";
          }, 2000);
        } else {
          this.error = data.error;
          this.loading = false;
          setTimeout(() => {
            this.error = "";
          }, 2000);
        }
      });
  }

  enableSplitsEdit() {
    if (this.splitItom) {
      this.splitItom = false;
      this.enableEdit = "U";
    } else {
      this.splitItom = true;
      this.enableEdit = "E";
    }
  }
  enableEvensEdit() {
    if (this.evenItom) {
      this.evenItom = false;
      this.enableEditEven = "U";
    } else {
      this.evenItom = true;
      this.enableEditEven = "E";
    }
  }

  //Left Click
  chnageFinalVal(val) {
    this.mainItom = false;

    this.mainVal = val;

    this.itemsRight = [];
    for (var i = val + 1; i < 1000; i += 2) {
      this.itemsRight.push([i, i + 1]);
    }
    var enen;
    if (this.mainVal % 2 == 1) {
      enen = this.mainVal + 1;
    } else {
      enen = this.mainVal;
    }
    this.topIndex = enen / 2 - 4;

    //Get value
    this.getFinalVal(val);
  }

  disabledAll() {
    if (this.stopItom == true) {
      this.stopAll = true;
      this.stopItom = false;
      this.boardService
        .updFancyStatus(
          this.boardDetails.game_type,
          this.boardDetails.match_id,
          3
        )
        .subscribe(data => {
          setTimeout(() => {
            this.resultVal = true;
          }, 2000);
        });
    } else {
      this.stopAll = false;
      this.stopItom = true;
    }
  }

  readonlyItom(itom) {
    if (this[itom] == true) {
      var status;
      if (itom == "bItom") {
        status = 4;
        this.boardService
          .updFancyStatus(
            this.boardDetails.game_type,
            this.boardDetails.match_id,
            status
          )
          .subscribe(data => {});
      } else if (itom == "sItom") {
        status = 1;
        this.boardService
          .updFancyStatus(
            this.boardDetails.game_type,
            this.boardDetails.match_id,
            status
          )
          .subscribe(data => {});
      }
    }

    this.sItom = true;
    this.bItom = true;
    this.mainItom = true;
    this.subItom = true;
    this[itom] = false;
  }
  selectSplitsOnly(val) {
    if (this.splitValOnly == "Splite") {
      this.splitValOnly = null;
      return;
    }

    if (this.splitValOnly == null) {
      this.splitVal = "90/110";
    }
    this.splitValOnly = val;
    this.evensVal = null;
    this.mainItom = true;
  }

  spliteValChange(splits, index) {
    let spliteVal = JSON.parse(localStorage.getItem("spliteVal"));
    spliteVal[index] = splits;
    localStorage.setItem("spliteVal", JSON.stringify(spliteVal));
  }

  selectSplits(val) {
    if (this.splitVal == val) {
      this.splitVal = null;
      return;
    }
    this.splitVal = val;
    this.evensVal = null;
    this.mainItom = true;
  }

  evensValChange(splits, index) {
    let evensVal = JSON.parse(localStorage.getItem("evensVal"));
    evensVal[index] = splits;
    localStorage.setItem("evensVal", JSON.stringify(evensVal));
  }

  selectEvens(val) {
    if (this.evensVal == val) {
      this.evensVal = null;
      return;
    }
    this.evensVal = val;
    this.splitVal = null;
    this.splitValOnly = null;
    this.mainItom = true;
  }

  selectTouchs(id) {
    this.touchsVal = id;
    this.status = id;
    this.boardService
      .updFancyStatus(
        this.boardDetails.game_type,
        this.boardDetails.match_id,
        this.status
      )
      .subscribe(data => {});
    setTimeout(() => {
      this.touchsVal = null;
    }, 500);
  }

  getFinalVal(val) {
    this.mainItom = false;
    var totalVal;
    if (this.splitVal == null && this.evensVal == null) {
      totalVal = val;
    } else if (this.splitValOnly == null && this.splitVal != null) {
      this.subVal = this.splitVal.replace("/", ".");
      totalVal = val + "." + this.subVal;
    } else if (this.splitValOnly != null && this.splitVal != null) {
      this.subVal = this.splitVal.replace("/", "-");
      let totalVal = val + "." + this.subVal;
    } else if (this.evensVal != null) {
      if (this.evensVal == "Even") {
        let totalVal = val + "*";
      } else if (this.evensVal == "EvenPlus") {
        let totalVal = val + " " + (parseInt(val) + 3);
      } else {
        this.subVal = this.evensVal.replace("/", ".");
        let totalVal = val + "*" + this.subVal;
      }
    }
    this.boardService
      .updFancyOdds(this.boardDetails.game_id, totalVal)
      .subscribe(data => {});
  }
}
