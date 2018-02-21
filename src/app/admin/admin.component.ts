import { Component, ViewChild, Input, OnInit, TemplateRef } from "@angular/core";
import { LoginService, AdminService, LibraryService } from "../_services/index";
import { Router } from "@angular/router";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { MomentModule } from "angular2-moment";
import { Observable } from "rxjs/Observable";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";

import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/modal-options.class";
import { Ng2DeviceService } from "ng2-device-detector";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"]
})
export class AdminComponent implements OnInit {
  public systemStatus: number;
  public balance: any;
  public exposure: any;
  public ticker: string;
  public currentUser: string;
  public inPlay: boolean;
  public filterFavId: object;

  public allGames: object;
  public gameStatus: boolean = true;
  public favGames: number[];
  public favGamesIds: number[];
  public gameIds: object;
  public marketIds: object;
  public oneAtATime: boolean;
  public isopen: boolean;
  public matchUnmatchSettings: object;
  public matchUnmatchSettingsUM: object;
  public tempAllLivebets: any[] = [];
  public allLivebets: any[] = [];
  public allLiveUbets: any[];
  public liveSearchGselid: number;

  public allUsers: object;
  public userStatus: boolean = true;
  public userIds: object;
  public toggle: object;

  public stakeVal: number;
  public quickStake1: number;
  public quickStake2: number;
  public quickStake3: number;
  public quickStake4: number;
  public quickStake5: number;
  public quickStake6: number;
  public betOptions: boolean;
  public deviceInfo: string;
  public datasever: boolean;
  public isOpen: object = {};

  public quickbet: boolean;
  public theme: string;

  public intervalPlay: boolean;
  public selectedOption: string;
  public modalRef: BsModalRef;
  public tabToggle: object;
  public objectKeys = Object.keys;
  public intervalMBets: boolean;
  public intervalUBets: boolean;
  public mobileActive: boolean;
  public updateMatchId: number = 0;
  public userType: number;
  public searchGame: string;
  public musearch: string;
  public homeGames: string;
  public consolidate: boolean = true;
  public isCollapsedMyBets: boolean = true;
  public isCollapsedReport: boolean = true;
  public isCollapsedUser: boolean = true;
  public collapsed(event: any): void { }
  public expanded(event: any): void { }
  public chkMbetResp: boolean = true;
  public chkUMbetResp: boolean = true
  public liveTV: boolean = false

  constructor(
    private modalService: BsModalService,
    private router: Router,
    private loginService: LoginService,
    public adminService: AdminService,
    public libraryService: LibraryService,
    private sessionStore: SessionStorageService,
    private deviceService: Ng2DeviceService
  ) {
    this.oneAtATime = true;
    this.intervalPlay = true;
    this.gameIds = {};
    this.marketIds = {};
    this.userIds = {};
    this.inPlay = false;
    this.toggle = {};
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  public ngOnInit() {
    this.allLivebets = [];
    this.allLiveUbets = [];

    let userStatusDetails = JSON.parse(
      this.sessionStore.retrieve("adminUserDetails")
    );
    this.userType = userStatusDetails.data.type;

    this.getLiveMbetsAll();
    this.getLiveUbetsAll();
    this.checkMatchOptions()

    this.intervalMBets = true;
    this.intervalUBets = true;

    IntervalObservable.create(1000).takeWhile(() => this.intervalPlay).subscribe(() => {
      this.getLiveMbetsAll();
    });

    IntervalObservable.create(2000)
      .takeWhile(() => this.intervalPlay)
      .subscribe(() => {
        this.getLiveUbetsAll();
      });

    // Check System Status
    this.systemStatus = 1;

    // Set Theme And One Click Bet
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"));
    this.stakeVal = preferenceVal.stakeVal;
    this.quickStake1 = preferenceVal.quickStake1;
    this.quickStake2 = preferenceVal.quickStake2;
    this.quickStake3 = preferenceVal.quickStake3;
    this.quickStake4 = preferenceVal.quickStake4;
    this.quickStake5 = preferenceVal.quickStake5;
    this.quickStake6 = preferenceVal.quickStake6;
    this.datasever = preferenceVal.datasever;
    this.betOptions = preferenceVal.betOptions;
    this.theme = preferenceVal.theme;

    // Put Device Info
    let deviceDetails = this.deviceService.getDeviceInfo();
    if (deviceDetails.device === "unknown") {
      this.deviceInfo = "destopView";
    } else {
      this.deviceInfo = "mobileView";
    }
    localStorage.setItem(
      "preferenceVal",
      JSON.stringify({
        stakeVal: this.stakeVal,
        quickStake1: this.quickStake1,
        quickStake2: this.quickStake2,
        quickStake3: this.quickStake3,
        quickStake4: this.quickStake4,
        quickStake5: this.quickStake5,
        quickStake6: this.quickStake6,
        betOptions: this.betOptions,
        datasever: this.datasever,
        theme: this.theme,
        deviceInfo: this.deviceInfo
      })
    );

    // Current User
    let userDetails: any = JSON.parse(
      this.sessionStore.retrieve("adminUserDetails")
    );
    if (userDetails) {
      this.currentUser = userDetails.data.username;
    }

    // Socket Data
    this.adminService.getSocketOdds().subscribe(data => {
      this.libraryService.showSocketData(data);
    })

    this.adminService.getSocketLotusOdds().subscribe(data => {
      this.libraryService.showSocketDataLotus(data)
    })

    this.checkCommentry();
  }

  ngAfterViewInit() {
    let windowheightAdmnMb = document.getElementById("admnMb").offsetHeight;

    this.matchUnmatchSettings = {
      actions: false,
      pager: {
        display: true,
        perPage: ((windowheightAdmnMb - 140) / 18).toFixed(0)
      },
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
        selname: {
          title: "Selection"
        },
        accountid: {
          title: "User",
          class: "userTl"
        },
        stake: {
          type: "html",
          title: "Stake",
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

    if (this.deviceInfo === "destopView") {
      let windowheightAdmnUb = document.getElementById("admnUb").offsetHeight;
      this.matchUnmatchSettingsUM = {
        actions: false,
        pager: {
          display: true,
          perPage: ((windowheightAdmnUb - 127) / 18).toFixed(0)
        },
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
          selname: {
            title: "Selection"
          },
          accountid: {
            title: "User",
            class: "userTl"
          },
          stake: {
            type: "html",
            title: "Stake",
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
    }
  }

  totalBalance() {
    this.adminService.getBalance().subscribe(data => {
      if (data.status === 1) {
        let temData = Number(data.data.balance).toFixed(2);
        this.balance = temData;
      }
    });
  }

  totalExposure() {
    this.adminService.getExposure().subscribe(data => {
      if (data.status === 1) {
        let temData = Number(data.data.tot_exposure).toFixed(2);
        this.exposure = temData;
      }
    });
  }

  getGamesNew() {
    this.gameStatus = true;
    let self = this;
    this.adminService.getGamesNew().subscribe(data => {
      let tempGame = this.libraryService.CreateGameIdWiseGames(data.data.games);
      self.allGames = this.libraryService.CreateCategoryWiseGames(tempGame);
      self.gameStatus = false;

      // Favorite Games
      this.favGames = data.data.games;
      this.favGamesIds = [];
      let favoriteGames: any = JSON.parse(
        localStorage.getItem("favoriteGames")
      );
      for (let itom in favoriteGames) {
        this.favGamesIds.push(Number(itom));
      }
      this.filterFavId = {
        game_id: {
          $or: this.favGamesIds
        }
      };
    });

    this.totalExposure();
    this.totalBalance();
  }

  idToTrackCategoriesWith(index, item) {
    return item.cat_name;
  }

  idToTrackGamesWith(index, item) {
    return item.game_id;
  }

  getUsers() {
    this.userStatus = true;
    this.mobileActive = false;
    this.adminService.getUsers().subscribe(data => {
      let userDetails = JSON.parse(
        this.sessionStore.retrieve("adminUserDetails")
      );
      userDetails = userDetails.data;
      userDetails["parent_root"] = "root";
      userDetails["className"] = "agent";
      userDetails["isExpanded"] = true;
      userDetails["undertree"] = JSON.stringify(data.data.users);
      let tempUser = [];
      tempUser.push(userDetails);
      this.allUsers = this.libraryService.jsonParse(tempUser);
      this.userStatus = false;
    });
  }

  openUser(user: any) {
    this.userIds = {};
    this.userIds[user.user_id] = user;
    this.mobileActive = false;
  }
  closeAllUser() {
    this.userIds = {};
  }

  chnageSystemStatus() {
    if (window.confirm("Please confirm?")) {
      if (this.systemStatus == 1) {
        this.systemStatus = 5;
      } else {
        this.systemStatus = 1;
      }
      this.adminService.systemPause(this.systemStatus).subscribe(data => { });
    }
  }

  getLiveUbetsAll() {
    if (this.chkUMbetResp) {
      this.chkUMbetResp = false;
      this.adminService.getLiveUbets().subscribe(data => {
        // call logout if token expire
        if (data.status === -99) {
          this.intervalPlay = false;
          this.LogOut();
        }
        this.allLiveUbets = data.data;
        //Bet Count By sellid
        this.adminService.setUBets(this.allLiveUbets);
        this.chkUMbetResp = true;
      }, error => (this.chkUMbetResp = true));
    }
  }

  getLiveMbetsAll() {
    if (this.chkMbetResp) {
      this.chkMbetResp = false;
      this.adminService.getLiveMbets(this.updateMatchId).subscribe(data => {
        // call logout if token expire
        if (data.status === -99) {
          this.intervalPlay = false;
          this.LogOut();
        }

        if (data.data.length != 0) {
          for (let item of data.data) {
            this.tempAllLivebets.unshift(item);
            if (item.bet_id > this.updateMatchId) {
              this.updateMatchId = item.bet_id;
            }
          }

          if (this.consolidate) {
            this.allLivebets = this.libraryService.consolidateBets(
              this.tempAllLivebets
            );
          } else {
            this.allLivebets = this.tempAllLivebets;
          }

          //Bet Count By sellid
          this.adminService.setBets(this.allLivebets);
          this.chkMbetResp = true;
        } else {
          this.chkMbetResp = true;
        }
      }, error => (this.chkMbetResp = true));
    }
  }

  checkConsolidate() {
    if (this.consolidate) {
      this.allLivebets = this.tempAllLivebets;
    } else {
      this.allLivebets = this.libraryService.consolidateBets(
        this.tempAllLivebets
      );
    }
    //Bet Count By sellid
    this.adminService.setBets(this.allLivebets);
  }

  // Check Token
  LogOut() {
    this.loginService.adminLogout();
    window.location.href = "/admin";
  }

  trackByBetId(index, item) {
    return item.bet_id;
  }

  isOpenChange(id) {
    if (this.isOpen[id]) {
      this.isOpen = {};
    } else {
      this.isOpen = {};
      this.isOpen[id] = true;
    }
  }

  checkMatchOptions() {
    IntervalObservable.create(500).subscribe(() => {
      let tempgameArray = []
      for (let item in this.gameIds) {
        tempgameArray.push(item)
      }
      if (!(tempgameArray.length == 0)) {
        // Chech Match Options
        this.adminService.getMatchoptionsGidsApi(JSON.stringify(tempgameArray)).subscribe(data => {
          if (data.status == 1) {
            this.adminService.setMatchOptions(data.data.games)
          }
        })
      }
    })
  }

  checkCommentry() {
    // IntervalObservable.create(5000).subscribe(() => {
    //   let currentActiveEventIds: any[] = [];
    //   for (let item in this.gameIds) {
    //     currentActiveEventIds.push(this.gameIds[item][0].event_id);
    //   }
    //   let eventIdsString = "";
    //   for (let item of currentActiveEventIds) {
    //     eventIdsString = item + "," + eventIdsString;
    //   }
    //   eventIdsString = eventIdsString.slice(0, -1);
    //   if (eventIdsString) {
    //     this.adminService.getInPlayService(eventIdsString).subscribe(data => {
    //       this.adminService.saveScoreResponse(data, currentActiveEventIds);
    //     });
    //   }
    // });

    this.adminService.getSocketScore().subscribe(data => {
      this.libraryService.setCommentryTotalVal(data);
    });

    // IntervalObservable.create(2000).subscribe(() => {
    //   //Call Commentry
    //   let allMarketids: any[] = [];
    //   for (let key in this.marketIds) {
    //     allMarketids.push(this.marketIds[key]);
    //   }

    //   for (let item of allMarketids) {
    //     this.adminService.getCommentry(item).subscribe(data => {
    //       if (
    //         data &&
    //         data.query &&
    //         data.query.results &&
    //         data.query.results.postresult &&
    //         data.query.results.postresult.json
    //       ) {
    //         let table = data.query.results.postresult.json.Table;
    //         if (table) {
    //           let tableSelection1 = table[0];
    //           if (tableSelection1) {
    //             this.libraryService.setCommentryTotalVal(
    //               item,
    //               tableSelection1["commentry"]
    //             );
    //           }
    //         }
    //       }
    //     });
    //   }
    // });
  }

  public liveTVTogel() {
    if (this.liveTV) {
      this.liveTV = false
    } else {
      this.liveTV = true
    }
  }

  public pageRefresh() {
    window.location.reload();
  }

  onClickOpenGame(game: any) {
    if (game.game_id in this.gameIds) {
      alert("Already added!");
    } else if (Object.keys(this.gameIds).length == 5) {
      alert("Already 5 games added!");
    } else {
      this.adminService.getGamesInfo([game.game_id]).subscribe(data => {
        if (data.status == 1) {
          this.gameIds[game.game_id] = data.data.games_info;
          this.marketIds[game.game_id] = game.market_id;
        }
      });
    }
  }
}
