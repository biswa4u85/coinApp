import { Injectable } from "@angular/core";
import {
  Http,
  Headers,
  RequestOptions,
  Response,
  URLSearchParams
} from "@angular/http";

import { environment } from "../../environments/environment";
import { LibraryService } from "../_services/library.service";

import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/throw";
import "rxjs/add/operator/timeoutWith";
import * as ioClient from "socket.io-client";

declare let io: any;

@Injectable()
export class AdminService {
  private socket;
  private socketScore: SocketIOClient.Socket;
  public shareSelid: number;
  public betType: string = "matched";
  public shareBets: any[] = [];
  public shareUBets: any[] = [];
  public tempGids: Object = {}
  public betOptions: object = {}
  public inPlayService: object = {};

  constructor(private http: Http, private libraryService: LibraryService) {
    this.socketScore = ioClient(environment.socketScoreUrl, {
      reconnection: true,
      port: "443",
      reconnectionDelay: 2000,
      reconnectionDelayMax: 3000,
      reconnectionAttempts: Infinity
    });

    this.socketScore.on("connect", function () {
      console.log("connected");
    })
    this.socketScore.on('reconnect', function (attempt) {
      console.log(`reconnect attempt ${attempt}`)
      for (let key in self.tempGids) {
        self.subscribeOdds(self.tempGids[key].gid, self.tempGids[key].mid, self.tempGids[key].lgId, self.tempGids[key].type)
      }
    })
    this.socketScore.on('reconnect_error', function (err) {
      console.log(`reconnect error ${err}`)
    })
    this.socketScore.on('reconnect_failed', function () {
      console.log(`reconnect failed`)
    })

    this.socket = io.connect(environment.socketUrl, {
      reconnect: true,
      port: environment.port,
      "reconnection delay": 2000,
      "reconnection limit": 3000,
      "max reconnection attempts": Infinity
    });
    let self = this;
    this.socket.on("reconnect", function (type, number) {
      //Subscribe all open games
      for (let key in self.tempGids) {
        self.subscribeOdds(self.tempGids[key].gid, self.tempGids[key].mid, self.tempGids[key].lgId, self.tempGids[key].type)
      }
    });
  }

  //Check Token
  checkToken() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "check_token", options)
      .map((response: Response) => response.json());
  }

  //System Pause
  systemPause(pause_val: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        pause_val: pause_val
      }
    };
    return this.http
      .get(environment.apiUrl + "system_pause", options)
      .map((response: Response) => response.json());
  }

  //Balance
  getBalance() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_balance", options)
      .map((response: Response) => response.json());
  }

  //Exposure
  getExposure() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_exposure", options)
      .map((response: Response) => response.json());
  }

  //Ticker
  getTicker() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_ticker", options)
      .map((response: Response) => response.json());
  }

  //Get Users
  getUsers() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_users", options)
      .map((response: Response) => response.json());
  }

  //All Users
  repUserlist() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "rep_userlist", options)
      .map((response: Response) => response.json());
  }

  //User Info
  getUserinfo(uid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_userinfo", options)
      .map((response: Response) => response.json());
  }

  //User Info
  getUser(uid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_user", options)
      .map((response: Response) => response.json());
  }

  //disconnect User
  disconnectUser(uid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid
      }
    };
    return this.http
      .get(environment.apiUrl + "disconnect_user", options)
      .map((response: Response) => response.json());
  }

  //Suspend Active User
  suspendActive(uid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid
      }
    };
    return this.http
      .get(environment.apiUrl + "suspend_active", options)
      .map((response: Response) => response.json());
  }

  //New User
  newUser(uid: any, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid,
        type: form.mod_newdealer_type,
        mod_newuser_name: form.mod_newdealer_name,
        mod_newuser_uname: form.mod_newdealer_uname,
        mod_newuser_pwd: form.mod_newdealer_pwd,
        mod_newuser_share: form.mod_newdealer_share,
        mod_newuser_phone: form.mod_newdealer_phone,
        mod_newuser_notes: form.mod_newdealer_notes
      }
    };
    return this.http
      .get(environment.apiUrl + "new_user", options)
      .map((response: Response) => response.json());
  }

  //New Cash
  newCashUser(uid: any, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid,
        type: 5,
        user_name: form.cash_user_name
      }
    };
    return this.http
      .get(environment.apiUrl + "new_cashuser", options)
      .map((response: Response) => response.json());
  }

  //New Dealer
  newDealer(uid: any, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid,
        type: 2,
        mod_newdealer_name: form.mod_newdealer_name,
        mod_newdealer_uname: form.mod_newdealer_uname,
        mod_newdealer_pwd: form.mod_newdealer_pwd,
        mod_newdealer_share: form.mod_newdealer_share,
        mod_newdealer_phone: form.mod_newdealer_phone,
        mod_newdealer_notes: form.mod_newdealer_notes
      }
    };
    return this.http
      .get(environment.apiUrl + "new_user", options)
      .map((response: Response) => response.json());
  }
  //Edit User
  editUser(uid: any, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid,
        mod_edituser_id: uid,
        mod_edituser_name: form.mod_newdealer_name,
        mod_edituser_uname: form.mod_newdealer_uname,
        mod_edituser_pwd: form.mod_newdealer_pwd,
        mod_edituser_share: form.mod_newdealer_share,
        mod_edituser_phone: form.mod_newdealer_phone,
        mod_edituser_notes: form.mod_newdealer_notes
      }
    };
    return this.http
      .get(environment.apiUrl + "edit_user", options)
      .map((response: Response) => response.json());
  }

  //Credit In
  creditIn(uid: any, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid,
        deposit_type: 2,
        mod_user_deposit_amt: form.mod_user_deposit_amt,
        mod_user_deposit_remark: form.mod_user_deposit_remark
      }
    };
    return this.http
      .get(environment.apiUrl + "user_deposit", options)
      .map((response: Response) => response.json());
  }

  //Credit Out
  creditOut(uid: any, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid,
        withdraw_type: 3,
        mod_user_withdraw_amt: form.mod_user_withdraw_amt,
        mod_user_withdral_remark: form.mod_user_withdral_remark
      }
    };
    return this.http
      .get(environment.apiUrl + "user_withdraw", options)
      .map((response: Response) => response.json());
  }

  //In Play Service
  getCommentry(marketId: string) {
    let url = "http://diamondexch9.com/gamedata.php";

    let options = {
      params: {
        q:
          "use 'https://raw.githubusercontent.com/yql/yql-tables/master/data/jsonpost.xml' " +
          "as jsonpost; select * from jsonpost where url = ' " +
          url +
          "' and postdata='marketid=" +
          marketId +
          "'",
        format: "json"
        // env: 'store://datatables.org/alltableswithkeys'
      }
    };

    return this.http
      .get("https://query.yahooapis.com/v1/public/yql", options)
      .map((response: Response) => response.json());
  }

  //Child Cash User
  getChildCashUser(selid: number, type: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        selid: selid,
        type: type
      }
    };
    return this.http
      .get(environment.apiUrl + "get_child_cash_user", options)
      .map((response: Response) => response.json());
  }

  //User Deposit
  userDeposit(uid: any, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid,
        cash_id: form.mod_user_cash_deposit,
        deposit_type: 4,
        mod_user_deposit_amt: form.mod_user_deposit_amt,
        mod_user_deposit_remark: form.mod_user_deposit_remark
      }
    };
    return this.http
      .get(environment.apiUrl + "user_deposit", options)
      .map((response: Response) => response.json());
  }

  //User Withdraw
  userWithdraw(uid: any, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid,
        cash_id: form.mod_user_cash_withdraw,
        withdraw_type: 5,
        mod_user_withdraw_amt: form.mod_user_withdraw_amt,
        mod_user_withdral_remark: form.mod_user_withdral_remark
      }
    };
    return this.http
      .get(environment.apiUrl + "user_withdraw", options)
      .map((response: Response) => response.json());
  }

  //settings User
  getSettings(uid: number, form) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid,
        gid: form.mod_settings_gid,
        opt: form.mod_settings_opt
      }
    };
    return this.http
      .get(environment.apiUrl + "get_settings", options)
      .map((response: Response) => response.json());
  }

  //Save settings User
  saveSettings(uid: number, form) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        uid: uid,
        gid: form.mod_settings_gid,
        opt: form.mod_settings_opt,
        inh: form.mod_settings_inh,
        val: form.mod_settings_val
      }
    };
    return this.http
      .get(environment.apiUrl + "save_settings", options)
      .map((response: Response) => response.json());
  }

  //New Games
  getGamesNew() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_games_new", options)
      .map((response: Response) => response.json());
  }

  //get Setting Games
  getSettingGames() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_setting_games", options)
      .map((response: Response) => response.json());
  }

  //User Info
  getGamesInfo(gIds: number[]) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        game_ids: JSON.stringify(gIds)
      }
    };
    return this.http
      .get(environment.apiUrl + "get_games_info", options)
      .map((response: Response) => response.json());
  }

  //Pause Game Tree
  pauseGamesTree(gid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        gid: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "pause_games_tree", options)
      .map((response: Response) => response.json());
  }

  //Pause Game Tree
  playGamesTree(gid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        gid: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "unpause_games_tree", options)
      .map((response: Response) => response.json());
  }

  //Game Odds
  getOdds(gid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        gid: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_odds", options)
      .map((response: Response) => response.json());
  }

  //Create Game
  createGame(gid: number, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        linked_id: gid,
        event_type_id: form.marketType,
        market_name: form.marketName,
        fancy_odd: form.numberOfBets
      }
    };
    return this.http
      .get(environment.apiUrl + "create_game", options)
      .map((response: Response) => response.json());
  }

  //Max Bets
  getMaxbets(gid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        game_id: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_maxbets", options)
      .map((response: Response) => response.json());
  }

  //Upd Max Bets
  updMaxbets(gid: number, mBets: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        game_id: gid,
        max_bets: mBets
      }
    };
    return this.http
      .get(environment.apiUrl + "upd_maxbets", options)
      .map((response: Response) => response.json());
  }

  //Get Fancy Setting
  getFancySettings(gid: number, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        game_id: gid,
        event_type_id: form.type,
        opt: form.opt
      }
    };
    return this.http
      .get(environment.apiUrl + "get_fancy_settings", options)
      .map((response: Response) => response.json());
  }

  //Save Fancy Setting
  saveFancySettings(gid: number, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        game_id: gid,
        event_type_id: form.type,
        opt: form.opt,
        val: form.val
      }
    };
    return this.http
      .get(environment.apiUrl + "save_fancy_settings", options)
      .map((response: Response) => response.json());
  }

  //Save Fancy Status
  updFancyStatus(eventId: number, marketId: number, status: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        event_type_id: eventId,
        market_id: marketId,
        status: status
      }
    };
    return this.http
      .get(environment.apiUrl + "upd_fancy_status", options)
      .map((response: Response) => response.json());
  }

  //Range Fancy Status
  updRangeFancyStatus(eventId: number, marketId: number, status: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        event_type_id: eventId,
        market_id: marketId,
        status: status
      }
    };
    return this.http
      .get(environment.apiUrl + "upd_range_fancy_status", options)
      .map((response: Response) => response.json());
  }

  //Game Status
  checkGameActive(gid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        game_id: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "check_game_active", options)
      .map((response: Response) => response.json());
  }

  placeBetNew(
    gid: number,
    gsid: number,
    type: string,
    odds: number,
    stake: number
  ) {
    let placeBetUrlSearchParams = new URLSearchParams();
    placeBetUrlSearchParams.append(`token`, this.libraryService.adminToken());
    placeBetUrlSearchParams.append(`gid`, gid.toString());
    placeBetUrlSearchParams.append(`gsid`, gsid.toString());
    placeBetUrlSearchParams.append(`type`, type.toString());
    placeBetUrlSearchParams.append(`odds`, odds.toString());
    placeBetUrlSearchParams.append(`stake`, stake.toString());
    let body = placeBetUrlSearchParams.toString();
    let headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded"
    }); // ... Set content type to JSON
    let options = new RequestOptions({ headers: headers }); // Create a request option
    return this.http
      .post(`${environment.apiUrl}place_bet_new&${body}`, null)
      .map((response: Response) => response.json());
  }

  //Book All
  getBookall(gid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        gid: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_bookall", options)
      .map((response: Response) => response.json());
  }

  //My M Bets
  getMyMBets(bet_id: number, game_id?: number) {
    let options: object;
    if (game_id) {
      options = {
        params: {
          token: this.libraryService.adminToken(),
          bet_id: bet_id,
          game_id: game_id
        }
      };
    } else {
      options = {
        params: {
          token: this.libraryService.adminToken(),
          bet_id: bet_id
        }
      };
    }
    return this.http
      .get(environment.apiUrl + "get_my_m_bets", options)
      .map((response: Response) => response.json());
  }

  //My U Bets
  getMyUBets(game_id?: number) {
    let options: object;
    if (game_id) {
      options = {
        params: {
          token: this.libraryService.adminToken(),
          game_id: game_id
        }
      };
    } else {
      options = {
        params: {
          token: this.libraryService.adminToken()
        }
      };
    }
    return this.http
      .get(environment.apiUrl + "get_my_u_bets", options)
      .map((response: Response) => response.json());
  }

  //My M Bets
  cancelBet(bid: number) {
    let options: object = {
      params: {
        token: this.libraryService.adminToken(),
        bid: bid
      }
    };
    return this.http
      .get(environment.apiUrl + "cancel_bet", options)
      .map((response: Response) => response.json());
  }

  //Live M Bets
  getLiveMbets(updateMId: number) {
    let options = {
      params: { token: this.libraryService.adminToken(), bet_id: updateMId }
    };
    return this.http
      .get(environment.apiUrl + "get_live_bets", options)
      .timeoutWith(10000, Observable.throw(new Error("Boom!")))
      .map((response: Response) => response.json());
  }

  //Live U Bets
  getLiveUbets() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_live_ubets", options)
      .timeoutWith(10000, Observable.throw(new Error("Boom!")))
      .map((response: Response) => response.json());
  }

  //Game Odds Fancy
  getOddsFancy(gid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        game_id: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_odds_fancy", options)
      .map((response: Response) => response.json());
  }

  //Upd Fancy Odds
  updFancyOdds(gid: number, form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        game_id: gid,
        fancy_odds: form.enterBets
      }
    };
    return this.http
      .get(environment.apiUrl + "upd_fancy_odds", options)
      .map((response: Response) => response.json());
  }

  //Game Profit
  getProfit(gid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        gid: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_profit", options)
      .map((response: Response) => response.json());
  }

  //Game Session Exp
  getSessionExp(gid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        gid: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_session_exp", options)
      .map((response: Response) => response.json());
  }

  //Game Fancy Books
  fancyBooks(typeId: number, gid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        event_type_id: typeId,
        game_id: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "fancy_books", options)
      .map((response: Response) => response.json());
  }

  //Account Reports
  getPlReportAll(from: any) {
    let suid = from.suid ? from.suid : this.libraryService.adminUId();
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        from: from.from,
        to: from.to,
        suid: suid,
        uid: from.uid,
        gid: from.gid,
        rtype: from.rtype,
        txntype: from.txntype,
        game_type: from.game_type
      }
    };
    return this.http
      .get(environment.apiUrl + "report_pl", options)
      .map((response: Response) => response.json());
  }

  // Txn Reports getTxnReport(from: Date, to: Date) {     let options = { params:
  // { token: this.libraryService.adminToken(), from: from.toISOString(), to:
  // to.toISOString() } }     return this.http.get(environment.apiUrl +
  // 'get_txn_report', options).map((response: Response) => response.json()); }
  // Account Pl Reports reportPl(from: string, to: string, suid: string, rtype:
  // string) {     let options = { params: { token:
  // this.libraryService.adminToken(), from: from, to: to, suid: suid, rtype:
  // rtype } }     return this.http.get(environment.apiUrl + 'report_pl',
  // options).map((response: Response) => response.json()); } Bet Reports
  getBetsReport(from: Date, to: Date, type: string) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        from: from.toISOString(),
        to: to.toISOString(),
        type: type
      }
    };
    return this.http
      .get(environment.apiUrl + "get_bets_report", options)
      .map((response: Response) => response.json());
  }

  //Change Password
  changePwd(pwd_old: string, pwd_new: string, pwd_confirm: string) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        pwd_old: pwd_old,
        pwd_new: pwd_new,
        pwd_confirm: pwd_confirm
      }
    };
    return this.http
      .get(environment.apiUrl + "change_pwd", options)
      .map((response: Response) => response.json());
  }

  //Check Advance Setting
  advanceSetting() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "advance_settings", options)
      .map((response: Response) => response.json());
  }

  //Advance Setting Upd
  advanceSettingUpd(form: any) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        idle_dt: form.idleDt,
        cricket_vol: form.cricketVal,
        soccer_vol: form.soccerVal,
        tennis_vol: form.tennisVal,
        horse_vol: form.horseVal
      }
    };
    return this.http
      .get(environment.apiUrl + "advance_setting_upd", options)
      .map((response: Response) => response.json());
  }

  //PL Reports
  getPlReport(short: number, type: String, date: Date) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        short: short,
        type: type,
        current_date: date,
        suid: 0
      }
    };
    return this.http
      .get(environment.apiUrl + "get_reports", options)
      .map((response: Response) => response.json());
  }

  //PL Reports
  getPlReportDetail(type: String, game_id: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        type: type,
        game_id: game_id,
        suid: 0
      }
    };
    return this.http
      .get(environment.apiUrl + "get_reports_detail", options)
      .map((response: Response) => response.json());
  }

  //Txn Reports
  getTxnReport(from: Date, to: Date) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        from: from,
        to: to
      }
    };
    return this.http
      .get(environment.apiUrl + "get_txn_report", options)
      .map((response: Response) => response.json());
  }

  //Account Pl Reports
  reportPl(from: string, to: string, suid: string, rtype: string) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        from: from,
        to: to,
        suid: suid,
        rtype: rtype
      }
    };
    return this.http
      .get(environment.apiUrl + "report_pl", options)
      .map((response: Response) => response.json());
  }

  //User PL Reports
  userGetPlReport(short: number, type: String, date: Date, uid: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        short: short,
        type: type,
        current_date: date,
        suid: uid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_reports", options)
      .map((response: Response) => response.json());
  }

  //User Account Pl Reports
  userReportPl(from: string, to: string, suid: string, rtype: string) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        from: from,
        to: to,
        suid: suid,
        rtype: rtype
      }
    };
    return this.http
      .get(environment.apiUrl + "report_pl", options)
      .map((response: Response) => response.json());
  }

  subscribeOdds(gid, mid, lgId, type) {
    let self = this;
    if (type == -9) {
      this.socketScore.emit("subscribe_lotus_odds", {
        token: this.libraryService.adminToken(),
        marketId: mid,
        groupById: lgId
      })
    } else {
      this.socket.emit("subscribe_odds", {
        token: this.libraryService.adminToken(),
        gid: gid
      })
    }
    if (!self.tempGids[gid]) {
      self.tempGids[gid] = { 'gid': gid, 'mid': mid, 'lgId': lgId, 'type': type }
    }

  }

  unSubscribeOdds(gid, mid, lgId, type) {
    let self = this;
    if (type == -9) {
      this.socketScore.emit("unsubscribe_lotus_odds", {
        token: this.libraryService.adminToken(),
        marketId: mid,
        groupById: lgId
      })
    } else {
      this.socket.emit("unsubscribe_odds", {
        token: this.libraryService.adminToken(),
        gid: gid
      })
    }
    delete self.tempGids[gid]

  }

  getSocketOdds() {
    let observable = new Observable(observer => {
      this.socket.on("odds", data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  getSocketLotusOdds() {
    let observable = new Observable(observer => {
      this.socketScore.on("lotus_odds", data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  subscribeScore(mId) {
    this.socketScore.emit("score", {
      token: this.libraryService.token(),
      marketId: mId
    });
  }

  unSubscribeScore(mId) {
    this.socketScore.emit("score", {
      token: this.libraryService.token(),
      marketId: mId
    });
  }

  getSocketScore() {
    let observable = new Observable(observer => {
      this.socketScore.on("score", data => {
        observer.next(data);
      });
      return () => {
        this.socketScore.disconnect();
      };
    });
    return observable;
  }

  subscribeScoreLotus(mId) {
    this.socketScore.emit("score", {
      token: this.libraryService.token(),
      marketId: mId
    });
  }

  unSubscribeScoreLotus(mId) {
    this.socketScore.emit("score", {
      token: this.libraryService.token(),
      marketId: mId
    });
  }

  getSocketScoreLotus() {
    let observable = new Observable(observer => {
      this.socketScore.on("score", data => {
        observer.next(data);
      });
      return () => {
        this.socketScore.disconnect();
      };
    });
    return observable;
  }

  setSelid(id) {
    this.shareSelid = id;
  }

  getSelid() {
    return this.shareSelid;
  }

  setkBetType(type) {
    this.betType = type;
  }

  checkBetType() {
    return this.betType;
  }

  setBets(obj) {
    this.shareBets = [];
    for (let item of obj) {
      this.shareBets.push(item);
    }
  }
  getBets(gSelid) {
    let data: any[] = [];
    for (let item of this.shareBets) {
      if (gSelid == item.selid) {
        data.push(item);
      }
    }
    return data;
  }

  setUBets(obj) {
    this.shareUBets = [];
    for (let item of obj) {
      this.shareUBets.push(item);
    }
  }
  getUBets(gSelid) {
    let data: any[] = [];
    for (let item of this.shareUBets) {
      if (gSelid == item.selid) {
        data.push(item);
      }
    }
    return data;
  }

  // Get Match Options Gids Api
  getMatchoptionsGidsApi(gids: string) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        gids: gids
      }
    };
    return this.http
      .get(environment.apiUrl + "get_matchoptions_gids", options)
      .map((response: Response) => response.json());
  }

  setMatchOptions(data) {
    this.betOptions = {}
    for (let item of data) {
      if (this.betOptions[item.bopt_gid]) {
        this.betOptions[item.bopt_gid].push(item)
      } else {
        this.betOptions[item.bopt_gid] = []
        this.betOptions[item.bopt_gid].push(item)
      }
    }
  }

  getMatchOptions(gId) {
    return this.betOptions[gId]
  }

  //Get Close Game Status
  getCloseGamesId(id, mid, lgId, type) {
    if (id in this.libraryService.closeGamesIds) {
      //Un Subscribe Odds
      this.unSubscribeOdds(id, mid, lgId, type)
      let status = this.libraryService.closeGamesIds[id];
      delete this.libraryService.closeGamesIds[id];
      return status;
    }
  }

  //User Account Pl Reports
  getLineGamesNew() {
    let options = {
      params: {
        token: this.libraryService.adminToken()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_line_games", options)
      .map((response: Response) => response.json());
  }

  //Get All Fancy
  getAllFancyGames() {
    let options = {
      // params: {
      //   token: this.libraryService.adminToken()
      // }
    };
    return this.http
      // .get(environment.apiUrl + "get_line_games", options)
      .get("http://localhost:3000/gamesfromlotus", options)
      .map((response: Response) => response.json());
  }

  //Get Sub Fancy
  getAllFancy(groupById: number) {
    let options = {
      params: {
        // token: this.libraryService.adminToken()
        groupById: groupById
      }
    }
    return this.http
      .post("http://localhost:3000/gamesfancylotus", options)
      .map((response: Response) => response.json());
  }

  //Get Sub Fancy
  addFancyLotus(groupById: number, marketId: number, parentMarketId: number, name: string) {
    let options = {
      params: {
        // token: this.libraryService.adminToken()
        groupById: groupById,
        marketId: marketId,
        parentMarketId: parentMarketId,
        name: name
      }
    }
    return this.http
      .post("http://localhost:3000/addfancylotus", options)
      .map((response: Response) => response.json());
  }

  getUpdGamesNew(value: number, game_id: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        value: value,
        game_id: game_id
      }
    };
    return this.http
      .get(environment.apiUrl + "upd_line_games", options)
      .map((response: Response) => response.json());
  }

  //Fancy Book
  fancyBook(gId: number) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        game_id: gId
      }
    };
    return this.http
      .get(environment.apiUrl + "fancy_books", options)
      .map((response: Response) => response.json());
  }

  //Fancy Result
  getFancyResult(from, gameId, gsid) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        game_id: gameId,
        gsid: 1,
        pwd: from.password,
        run: from.winner
      }
    };
    return this.http
      .get(environment.apiUrl + "save_result_session", options)
      .map((response: Response) => response.json());
  }

  // Report Cash pl report
  repCashPlReport(user_id) {
    let options = {
      params: {
        token: this.libraryService.adminToken(),
        user_id: user_id
      }
    };
    return this.http
      .get(environment.apiUrl + "rep_cash_pl_report", options)
      .map((response: Response) => response.json());
  }

  //In Play Service
  getInPlayService(eventIds: any) {
    let ts = Date.now();
    let url =
      "http://www.betfair.com/inplayservice/v1.1/scores?regionCode=UK&alt=json&locale=e" +
      "n_GB&eventIds=" +
      eventIds +
      "&ts=" +
      ts;

    let options = {
      params: {
        q: "select * from json where url = ' " + url + "' ",
        format: "json"
      }
    };

    return this.http
      .get("https://query.yahooapis.com/v1/public/yql", options)
      .map((response: Response) => response.json());
  }

  //Save Live Score
  saveScoreResponse(data, eventIds) {
    if (data["query"] != undefined) {
      if (data.query != null && data.query.results != null) {
        let newResult = data.query.results.json;
        let tempInPlayService;

        for (let item of eventIds) {
          this.inPlayService[item] = true;
        }

        if (newResult.json != undefined) {
          tempInPlayService = newResult.json;
          for (let item of tempInPlayService) {
            if (item.eventTypeId == "2") {
              item.currentSet = item.currentSet
                ? parseInt(item.currentSet)
                : "";
              item.TennisSetSequence = [];
              for (let i = 1; i <= item.currentSet; i++) {
                item.TennisSetSequence.push(i);
              }
              if (item.score.home.gameSequence) {
                if (typeof item.score.home.gameSequence == "string") {
                  let homeScore = parseInt(item.score.home.gameSequence);
                  let awayScore = parseInt(item.score.away.gameSequence);

                  item.score.home.gameSequence = [homeScore];
                  item.score.away.gameSequence = [awayScore];
                }
              } else {
                item.score.home.gameSequence = [];
                item.score.away.gameSequence = [];
              }
            }
            if (item.eventId in this.inPlayService) {
              this.inPlayService[item.eventId] = item;
            }
          }
        } else {
          let item = newResult;
          if (item.eventTypeId == "2") {
            item.currentSet = item.currentSet ? parseInt(item.currentSet) : "";
            item.TennisSetSequence = [];
            for (let i = 1; i <= item.currentSet; i++) {
              item.TennisSetSequence.push(i);
            }
            if (item.score.home.gameSequence) {
              if (typeof item.score.home.gameSequence == "string") {
                let homeScore = parseInt(item.score.home.gameSequence);
                let awayScore = parseInt(item.score.away.gameSequence);

                item.score.home.gameSequence = [homeScore];
                item.score.away.gameSequence = [awayScore];
              }
            } else {
              item.score.home.gameSequence = [];
              item.score.away.gameSequence = [];
            }
          }
          if (item.eventId in this.inPlayService) {
            this.inPlayService[item.eventId] = item;
          }
        }
        //  console.log(inPlayService)
        return this.inPlayService;
      }
    }
  }

  //Get ScoreResponse
  getScoreResponse(eventId) {
    return this.inPlayService[eventId];
  }
}
