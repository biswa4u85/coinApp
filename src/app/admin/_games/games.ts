import { Component, Input, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { AdminService, LibraryService } from "../../_services/index";
import { Observable } from "rxjs/Observable";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { DragScroll } from "angular2-drag-scroll";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/modal-options.class"
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser'

@Component({ selector: "admin-games", templateUrl: "./games.html" })
export class AdminGamesComponent implements OnInit {
  @Input() gameIds: object;
  @Input() marketIds: object;
  @Input() currentGameId: number;
  public gamesArray: any;
  public objectKeys = Object.keys;
  public modalRef: BsModalRef;
  public toggle: object;
  public editFancyDetails: object;
  public gamePlayPause: object;
  public userType: number;
  public parentGame;
  public tempGameId: number;
  @ViewChild("gameTab", { read: DragScroll })
  ds: DragScroll;
  public dragScroll: DragScroll;
  public leftNavDisabled = false;
  public rightNavDisabled = false;
  public normalGames: any[] = []
  public otherGamesFancy: any[] = []
  public tempMatchOpt: any[] = []
  public tvUrl: SafeResourceUrl

  constructor(
    private adminService: AdminService,
    public libraryService: LibraryService,
    private modalService: BsModalService,
    private sessionStore: SessionStorageService,
    private sanitizer: DomSanitizer
  ) {
    this.gamePlayPause = {};
    this.toggle = {};
  }

  checkGameStatus(id, mid, lgId, type) {
    let tempCheckGameStatus = this.adminService.getCloseGamesId(id, mid, lgId, type)
    if (tempCheckGameStatus && tempCheckGameStatus.bopt_main == 1) {
      setTimeout(() => {
        this.closeGmae();
      }, 10000);
    } else if (tempCheckGameStatus && tempCheckGameStatus.bopt_main == 0) {
      setTimeout(() => {
        this.openTabs(id, mid, lgId, type)
      }, 10000);
    }
  }

  public ngOnInit() {
    this.gamesArray = this.gameIds[this.currentGameId]

    // Asign Parent Game
    for (let item of this.gamesArray) {
      if (item.bopt_main == 1) {
        this.parentGame = item
        this.normalGames.push(item)
        this.tempMatchOpt.push(item.game_id)
        this.toggle[item.game_id] = true
        this.adminService.subscribeOdds(item.game_id, item.market_id, item.lotus_group_id, item.game_type)
        this.adminService.subscribeScoreLotus(item.market_id)
        this.tempGameId = item.game_id
      }
    }


    if (this.parentGame.game_type == 1) {
      this.tvUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://videoplayer.betfair.com/GetPlayer.do?tr=1&width=334&height=245&contentOnly=false&eID=' + this.parentGame.event_id)
    } else {
      this.tvUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://videoplayer.betfair.com/GetPlayer.do?tr=1&width=334&height=192&contentOnly=false&eID=' + this.parentGame.event_id)
    }

    let userStatusDetails = JSON.parse(
      this.sessionStore.retrieve("adminUserDetails")
    );
    this.userType = userStatusDetails.data.type;
  }

  // Check New Match Options
  newMatchOptions(gid) {
    let newMatchOpt = this.adminService.getMatchOptions(gid)
    if (newMatchOpt) {
      // If New Match Options Comes
      for (let item of newMatchOpt) {
        if (this.tempMatchOpt.indexOf(item.game_id) == -1) {
          this.tempMatchOpt.push(item.game_id)
          if (item.game_type == -8 || item.game_type == -9) {
            this.otherGamesFancy.push(item)
            this.toggle[item.game_id] = true
            this.adminService.subscribeOdds(item.game_id, item.market_id, item.lotus_group_id, item.game_type)
            this.adminService.subscribeScoreLotus(item.market_id)
          } else {
            this.normalGames.push(item)
          }
        }
      }

      // If New Match Options Closeed
      let tempGid = []
      for (let item of newMatchOpt) {
        tempGid.push(item.game_id)
      }
      for (let item of this.tempMatchOpt) {
        if (tempGid.indexOf(item) == -1) {

          this.tempMatchOpt.splice(this.tempMatchOpt.indexOf(item), 1)

          // Fancy games
          for (let itemObj of this.otherGamesFancy) {
            if (item == itemObj.game_id) {
              this.toggle[itemObj.game_id] = false
              this.adminService.unSubscribeOdds(itemObj.game_id, itemObj.market_id, itemObj.lotus_group_id, itemObj.game_type)
              this.adminService.unSubscribeScoreLotus(itemObj.market_id)
              this.otherGamesFancy.splice(this.otherGamesFancy.indexOf(itemObj), 1)
            }
          }


          // Normal Game
          for (let itemObj of this.normalGames) {
            if (item == itemObj.game_id) {
              this.toggle[itemObj.game_id] = false
              this.adminService.unSubscribeOdds(itemObj.game_id, itemObj.market_id, itemObj.lotus_group_id, itemObj.game_type)
              this.adminService.unSubscribeScoreLotus(itemObj.market_id)
              this.normalGames.splice(this.normalGames.indexOf(itemObj), 1)
            }
          }

        }
      }
    }
  }

  moveLeft() {
    this.ds.moveLeft();
  }

  moveRight() {
    this.ds.moveRight();
  }

  openBoard(item) {
    localStorage.setItem(
      "boardDet",
      JSON.stringify({
        game_name: item.game_name,
        market_name: item.market_name,
        game_id: item.game_id
      })
    );
    localStorage.setItem("deveceDet", JSON.stringify("destop"));
    window.open(
      "/keyboard",
      "mywindow",
      "menubar=0,resizable=0,width=800,height=450"
    );
  }

  leftBoundStat(reachesLeftBound: boolean) {
    this.leftNavDisabled = reachesLeftBound;
  }

  rightBoundStat(reachesRightBound: boolean) {
    this.rightNavDisabled = reachesRightBound;
  }

  openTabs(id, mid, lgId, type) {
    if (this.toggle[id]) {
      this.adminService.unSubscribeOdds(id, mid, lgId, type);
      this.adminService.unSubscribeScore(mid);
      this.adminService.unSubscribeScoreLotus(mid);
      delete this.toggle[id];
      return;
    }
    this.adminService.subscribeOdds(id, mid, lgId, type);
    this.adminService.subscribeScore(mid);
    this.adminService.subscribeScoreLotus(mid);
    this.toggle[id] = true;
    this.tempGameId = id;
  }

  public addFancy(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  public editFancy(template: TemplateRef<any>, itom) {
    this.modalRef = this.modalService.show(template);
    this.editFancyDetails = itom;
  }

  closeGmae() {
    delete this.gameIds[this.currentGameId];
    delete this.marketIds[this.currentGameId];

    //Unsubscribe Sockets
    for (let item of this.normalGames) {
      this.adminService.unSubscribeOdds(item.game_id, item.market_id, item.lotus_group_id, item.game_type)
      this.adminService.unSubscribeScore(item.market_id);
      this.adminService.unSubscribeScoreLotus(item.market_id);
    }

    for (let item of this.otherGamesFancy) {
      this.adminService.unSubscribeOdds(item.game_id, item.market_id, item.lotus_group_id, item.game_type)
      this.adminService.unSubscribeScore(item.market_id);
      this.adminService.unSubscribeScoreLotus(item.market_id);
    }
  }

  playPauseGameTree(gId) {
    if (this.gamePlayPause[gId] == 5) {
      this.adminService.playGamesTree(gId).subscribe(data => {
        this.gamePlayPause[gId] = 1;
      });
    } else {
      this.adminService.pauseGamesTree(gId).subscribe(data => {
        this.gamePlayPause[gId] = 5;
      });
    }
  }
}
