import { Component, Input, TemplateRef, OnInit } from "@angular/core";
import { AdminService } from "../../_services/index";
import { LibraryService } from "../../_services/library.service";
import { Observable } from "rxjs/Observable";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/modal-options.class";

@Component({
  selector: "admin-linesocket",
  templateUrl: "./socketfancy.html"
})
export class LineAdminSocketComponent implements OnInit {
  @Input() gameDetails;
  public marketName: string;
  public oddsDetail;
  public matchedBets: object;
  public unMatchedBets: object;
  public oddBox: object;
  public betDetails: object;
  public currentBet;
  public errorMsg: string;
  public bookDetails: any;
  public objectKeys = Object.keys;
  public matchUmatchCount: object = {};
  public deviceInfo: string;
  public modalRef: BsModalRef;

  constructor(
    private adminService: AdminService,
    private modalService: BsModalService,
    public libraryService: LibraryService
  ) {
    this.oddBox = [0, 1, 2];
    this.betDetails = {};
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  public ngOnInit() {
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"));
    this.deviceInfo = preferenceVal.deviceInfo;

    //Get Odds
    this.adminService.getOdds(this.gameDetails.game_id).subscribe(data => {
      if (data.status == 1) {
        if (data.data.event_type_id == '-9') {
          for (let item of data.data.selections_pl) {
            item['gselid_bf'] = item.gselid
          }
          this.oddsDetail = data.data.selections_pl
        } else {
          this.oddsDetail = data.data.selections
        }

        this.bookAll();
        IntervalObservable.create(5000).subscribe(() => {
          this.checkBook();
          // this.bookAll()
        });
      }
    });
  }

  checkBook() {
    for (let item of this.oddsDetail) {
      if (!(item.gselid in this.matchUmatchCount)) {
        this.matchUmatchCount[item.gselid] = { match: 0, unmatch: 0 };
      }
      let matchedCount: number;
      if (document.getElementById("match_" + item.gselid)) {
        matchedCount = Number(
          document.getElementById("match_" + item.gselid).innerHTML
        );
      }
      let unmatchedCount: number;
      if (document.getElementById("unmatch_" + item.gselid)) {
        unmatchedCount = Number(
          document.getElementById("unmatch_" + item.gselid).innerHTML
        );
      }
      if (
        this.matchUmatchCount[item.gselid].match != matchedCount ||
        this.matchUmatchCount[item.gselid].unmatch != unmatchedCount
      ) {
        this.bookAll();
      }
      this.matchUmatchCount[item.gselid].match = matchedCount;
      this.matchUmatchCount[item.gselid].unmatch = unmatchedCount;
    }
  }
  bookAll() {
    this.adminService.getBookall(this.gameDetails.game_id).subscribe(data => {
      if (data.status == 1) {
        if (data.data.users.length == 0) {
          this.errorMsg = "Empty book for selected game!";
        } else {
          let tempData = data.data;
          tempData["parent"] = {};
          for (let item in tempData.own) {
            tempData["parent"][item] = tempData.own[item];
          }
          for (let item in tempData.users) {
            for (let subItem in tempData.users[item].selections) {
              tempData["parent"][subItem] =
                Number(tempData["parent"][subItem]) +
                Number(tempData.users[item].selections[subItem]);
            }
          }
          //Reverse Value
          for (let item in tempData.parent) {
            tempData["parent"][item] = (Number(-1) *
              Number(tempData.parent[item])
            ).toFixed(2);
          }
          this.bookDetails = tempData;

          this.errorMsg = "";
        }
      } else {
        this.errorMsg = data.error;
      }
    });
  }

  closeGame(panel) {
    // panel.classList.toggle("collapse");
  }

  public getCloseBet(): void {
    this.currentBet = "";
  }
}
