import {
  Component,
  ViewChild,
  Input,
  OnInit,
  TemplateRef
} from "@angular/core";
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
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.scss"]
})
export class BoardComponent implements OnInit {
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
  public collapsed(event: any): void {}
  public expanded(event: any): void {}

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
    // this.tabToggle = {} this.tabToggle['matched'] = true

    this.allLivebets = [];
    this.allLiveUbets = [];

    // Check Token
    IntervalObservable.create(5000)
      .takeWhile(() => this.intervalPlay)
      .subscribe(() => {
        this.adminService.checkToken().subscribe(data => {
          if (data.status !== 1) {
            this.loginService.adminLogout();
            window.location.href = "/admin";
            this.intervalPlay = false;
          }
        });
      });

    let userStatusDetails = JSON.parse(
      this.sessionStore.retrieve("adminUserDetails")
    );
    this.userType = userStatusDetails.data.type;

    this.getLiveMbetsAll();
    this.getLiveUbetsAll();

    this.intervalMBets = true;
    this.intervalUBets = true;

    IntervalObservable.create(5000)
      .takeWhile(() => this.intervalMBets)
      .subscribe(() => {
        this.getLiveMbetsAll();
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
    });

    // Table Titles
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

    this.checkCommentry();
  }

  checkTabToggle() {
    // let tempBetType = this.adminService.checkBetType() if (tempBetType ==
    // 'unmatched') {   this.tabToggle = {};   this.tabToggle['unmatched'] = true }
    // else {   this.tabToggle = {};   this.tabToggle['matched'] = true }
  }
  openTabs(id) {
    // this.tabToggle = {}; this.tabToggle[id] = true; if (id == 'matched') {
    // this.intervalUBets = false   this.intervalMBets = true
    // IntervalObservable.create(5000).takeWhile(() =>
    // this.intervalMBets).subscribe(() => {     this.getLiveMbetsAll();   }) } else
    // {   this.intervalMBets = false   this.intervalUBets = true
    // IntervalObservable.create(5000).takeWhile(() =>
    // this.intervalUBets).subscribe(() => {     this.getLiveUbetsAll();   }) }
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

  chnageSystemStatus() {
    if (window.confirm("Please confirm?")) {
      if (this.systemStatus == 1) {
        this.systemStatus = 5;
      } else {
        this.systemStatus = 1;
      }
      this.adminService.systemPause(this.systemStatus).subscribe(data => {});
    }
  }

  getLiveUbetsAll() {
    this.adminService.getLiveUbets().subscribe(data => {
      this.allLiveUbets = data.data;

      //Bet Count By sellid
      this.adminService.setUBets(this.allLiveUbets);
    });
  }

  onUserRowSelect(event): void {
    console.log(event);
    //this.selectedRow = this.getParentsUntil(ev.target, '.ng2-smart-row')[0];
  }

  getLiveMbetsAll() {
    // var self = this
    this.adminService.getLiveMbets(this.updateMatchId).subscribe(data => {
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
    });
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

  checkCommentry() {
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
