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
import { MatSnackBar } from "@angular/material";

import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

import "rxjs/add/operator/takeWhile";
import * as ioClient from 'socket.io-client';

declare let io: any;

@Injectable()
export class HomeService {
  private socket;
  private socketScore: SocketIOClient.Socket;
  public myBetsStatus: boolean = false;
  public totalGameMUDetails: object = {};
  public totalGameProfit: object = {};
  public placeBetDetails: object = {};
  public mobileTabActive: string = "";
  public betOptions: object = {}
  public tempGids: Object = {}
  public inPlayService: object = {};

  public tempPrefit: object = {};

  constructor(
    private http: Http,
    public snackBar: MatSnackBar,
    private libraryService: LibraryService
  ) {
    this.socketScore = ioClient(environment.socketScoreUrl, {
      reconnection: true,
      port: '443',
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000,
      randomizationFactor: 0,
      reconnectionAttempts: Infinity
    })

    this.socketScore.on('connect', function () {
      console.log('connected')
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
    this.socket.on("connect", function () {
      console.log("connect");
    });
    this.socket.on("reconnect", function (type, number) {
      console.log("reconnected");
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
        token: this.libraryService.token()
      }
    };
    return this.http
      .get(environment.apiUrl + "check_token", options)
      .map((response: Response) => response.json());
  }

  //Balance
  getBalance() {
    let options = {
      params: {
        token: this.libraryService.token()
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
        token: this.libraryService.token()
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
        token: this.libraryService.token()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_ticker", options)
      .map((response: Response) => response.json());
  }

  //New Games
  getGames() {
    let options = {
      params: {
        token: this.libraryService.token()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_games_new", options)
      .map((response: Response) => response.json());
  }

  //Home Page Games
  getGamesForHomepage() {
    let options = {
      params: {
        token: this.libraryService.token()
      }
    };
    return this.http
      .get(environment.apiUrl + "get_games_for_homepage", options)
      .map((response: Response) => response.json());
  }

  //Home Page Games
  getBetsData(
    betId: number,
    lastBetTime: number,
    gameIds: string,
    lastPlTime: Date
  ) {
    let options = {
      params: {
        token: this.libraryService.token(),
        game_ids: gameIds,
        bet_id: betId,
        lasttime_details: lastBetTime,
        pltime: lastPlTime
      }
    };
    return this.http
      .get(environment.apiUrl + "get_bets_change", options)
      .map((response: Response) => response.json());
  }

  //Game Odds
  getOdds(gid: number) {
    let options = {
      params: {
        token: this.libraryService.token(),
        gid: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_odds", options)
      .map((response: Response) => response.json());
  }

  //Match Un Match Details
  getBetsDetails(gids: number[]) {
    let options = {
      params: {
        token: this.libraryService.token(),
        game_ids: JSON.stringify(gids)
      }
    };
    return this.http
      .get(environment.apiUrl + "get_bets_details", options)
      .map((response: Response) => response.json());
  }

  //Check Match Un Match Details
  checkMatchUmatchDetails(gids: number[]) {
    let options = {
      params: {
        token: this.libraryService.token(),
        game_ids: JSON.stringify(gids)
      }
    };
    return this.http
      .get(environment.apiUrl + "get_bets_count", options)
      .map((response: Response) => response.json());
  }

  //Match Un Match Details
  getOneTimeBets(gids: number[]) {
    let options = {
      params: {
        token: this.libraryService.token(),
        game_ids: JSON.stringify(gids)
      }
    };
    return this.http
      .get(environment.apiUrl + "get_one_time_bets", options)
      .map((response: Response) => response.json());
  }

  placeBetNew(
    gid: number,
    gsid: number,
    type: string,
    odds: number,
    stake: number,
    gameType: number,
    orgStake: number
  ) {
    let placeBetUrlSearchParams = new URLSearchParams();
    placeBetUrlSearchParams.append(`token`, this.libraryService.token());
    placeBetUrlSearchParams.append(`gid`, gid.toString());
    placeBetUrlSearchParams.append(`gsid`, gsid.toString());
    placeBetUrlSearchParams.append(`type`, type.toString());
    if (gameType == -9) {
      let runs: number = odds
      odds = orgStake / 100
      placeBetUrlSearchParams.append(`runs`, runs.toString());
      placeBetUrlSearchParams.append(`stake`, stake.toString());
      placeBetUrlSearchParams.append(`odds`, odds.toString());
    } else {
      placeBetUrlSearchParams.append(`odds`, odds.toString());
      placeBetUrlSearchParams.append(`stake`, stake.toString());
    }

    let body = placeBetUrlSearchParams.toString();
    let headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded"
    }); // ... Set content type to JSON
    let options = new RequestOptions({ headers: headers }); // Create a request option
    if (gameType == -8) {
      return this.http
        .post(`${environment.apiUrl}place_score_bets&${body}`, null)
        .map((response: Response) => response.json());
    } else if (gameType == -9) {
      return this.http
        .post(`${environment.apiUrl}place_score_bets&${body}`, null)
        .map((response: Response) => response.json());
    } else {
      return this.http
        .post(`${environment.apiUrl}place_bet_new&${body}`, null)
        .map((response: Response) => response.json());
    }
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

  //My M Bets
  getMyMBets(bet_id: number, game_id?: number) {
    let options: object;
    if (game_id) {
      options = {
        params: {
          token: this.libraryService.token(),
          bet_id: bet_id,
          game_id: game_id
        }
      };
    } else {
      options = {
        params: {
          token: this.libraryService.token(),
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
          token: this.libraryService.token(),
          game_id: game_id
        }
      };
    } else {
      options = {
        params: {
          token: this.libraryService.token()
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
        token: this.libraryService.token(),
        bid: bid
      }
    };
    return this.http
      .get(environment.apiUrl + "cancel_bet", options)
      .map((response: Response) => response.json());
  }

  //Game Odds Fancy
  getOddsFancy(gid: number) {
    let options = {
      params: {
        token: this.libraryService.token(),
        game_id: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_odds_fancy", options)
      .map((response: Response) => response.json());
  }

  //Game Profit
  getProfit(gid: number) {
    let options = {
      params: {
        token: this.libraryService.token(),
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
        token: this.libraryService.token(),
        gid: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "get_session_exp", options)
      .map((response: Response) => response.json());
  }

  // Get Match Options Gids Api
  getMatchoptionsGidsApi(gids: string) {
    let options = {
      params: {
        token: this.libraryService.token(),
        gids: gids
      }
    };
    return this.http
      .get(environment.apiUrl + "get_matchoptions_gids", options)
      .map((response: Response) => response.json());
  }

  //Game Fancy Books
  fancyBooks(typeId: number, gid: number) {
    let options = {
      params: {
        token: this.libraryService.token(),
        event_type_id: typeId,
        game_id: gid
      }
    };
    return this.http
      .get(environment.apiUrl + "fancy_books", options)
      .map((response: Response) => response.json());
  }

  //PL Reports
  getPlReport(short: number, type: String, date: Date) {
    let options = {
      params: {
        token: this.libraryService.token(),
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

  //Txn Reports
  getTxnReport(from: Date, to: Date) {
    let options = {
      params: {
        token: this.libraryService.token(),
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
        token: this.libraryService.token(),
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

  //Bet Reports
  getBetsReport(from: Date, to: Date, type: string) {
    let options = {
      params: {
        token: this.libraryService.token(),
        from: from,
        to: to,
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
        token: this.libraryService.token(),
        pwd_old: pwd_old,
        pwd_new: pwd_new,
        pwd_confirm: pwd_confirm
      }
    };
    return this.http
      .get(environment.apiUrl + "change_pwd", options)
      .map((response: Response) => response.json());
  }

  //Fancy Book
  fancyBook(gId: number) {
    let options = {
      params: {
        token: this.libraryService.token(),
        game_id: gId
      }
    };
    return this.http
      .get(environment.apiUrl + "fancy_books", options)
      .map((response: Response) => response.json());
  }

  subscribeOdds(gid, mid, lgId, type) {
    let self = this;
    if (type == -9) {
      this.socketScore.emit("subscribe_lotus_odds", {
        token: this.libraryService.token(),
        marketId: mid,
        groupById: lgId
      })
    } else {
      this.socket.emit("subscribe_odds", {
        token: this.libraryService.token(),
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
        token: this.libraryService.token(),
        marketId: mid,
        groupById: lgId
      })
    } else {
      this.socket.emit("unsubscribe_odds", {
        token: this.libraryService.token(),
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

  setMyBetStatus() {
    if (this.myBetsStatus) {
      this.myBetsStatus = false;
    } else {
      this.myBetsStatus = true;
    }
  }
  getMyBetStatus() {
    return this.myBetsStatus;
  }

  setMUBets(obj) {
    for (let item in obj) {
      this.totalGameMUDetails[item] = obj[item];
    }
  }

  setPlaceBetMUBets(obj) { }

  getMUBets(gId) {
    return this.totalGameMUDetails[gId];
  }

  getMUBetsByGselid(gId, gSelid, matchType) {
    let tempData = this.totalGameMUDetails[gId][matchType];
    let data: any[] = [];
    for (let itom of tempData) {
      if (itom.selid == gSelid) {
        data.push(itom);
      }
    }
    return data;
  }

  setProfit(obj) {
    this.totalGameProfit[obj.gId] = obj.data;
  }

  getProfitsByGselid(gId, gSelid) {
    let tempData = this.totalGameProfit[gId];
    let data: string = "";
    for (let itom of tempData) {
      if (itom.gselid == gSelid) {
        let tempPrice: number = itom.gselpl.pl_num;
        if (tempPrice >= 0) {
          data =
            '<span class="positive">' + Number(tempPrice).toFixed(2) + "<span>";
        } else {
          data =
            '<span class="negative">' + Number(tempPrice).toFixed(2) + "<span>";
        }
      }
    }
    return data;
  }

  setPlaceBetValue(obj) {
    this.placeBetDetails = {};
    this.placeBetDetails = obj;
  }

  getPlaceBetValue() {
    return this.placeBetDetails;
  }

  setMobileTabActive(name) {
    this.setTempPrefit("");

    this.mobileTabActive = name;
    if (name) {
      document.getElementById("turnOnLight").className = "gameBoxBottomMargin";
      document.getElementById("tornLight").style.height = "100%";
    } else {
      document.getElementById("turnOnLight").classList.remove("gameBoxBottomMargin");
    }
  }

  getMobileTabActive() {
    return this.mobileTabActive;
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
      this.unSubscribeOdds(id, mid, lgId, type);
      let status = this.libraryService.closeGamesIds[id];
      delete this.libraryService.closeGamesIds[id];
      return status;
    }
  }

  setTempPrefit(tId?, id?, type?, odd?, stake?) {
    if (tId == "") {
      this.tempPrefit = {};
    } else {
      this.tempPrefit = {};
    }

    let tempValOwn: number;
    let tempValOther: number;

    if (type == "backPrices_") {
      tempValOwn = Number((odd - 1) * stake);
      tempValOther = Number(stake * -1);
    } else {
      tempValOwn = Number((odd - 1) * stake * -1);
      tempValOther = Number(stake);
    }

    for (let item of tId) {
      if (item === id) {
        this.tempPrefit[item] = tempValOwn ? tempValOwn.toFixed(2) : null;
      } else {
        this.tempPrefit[item] = tempValOther ? tempValOther.toFixed(2) : null;
      }
    }
  }

  getTempProfit(id) {
    return this.tempPrefit[id];
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

  newPlaceBetAll(betDetails) {
    let gid: number = betDetails.gid;
    let gsid: number = betDetails.gsid;
    let gameType = betDetails.type;
    let orgAmount = betDetails.orgAmount;
    let type: string = "";
    if (betDetails.bType == "layPrices_") {
      type = "l";
    } else {
      type = "b";
    }
    let odds: number;
    let stake: number;
    odds = betDetails.orgPrice;
    stake = betDetails.defultStakeVal;

    this.placeBetNew(gid, gsid, type, odds, stake, gameType, orgAmount).subscribe(data => {
      if (data.status == 1 || data.status == 2 || data.status == 3) {
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
      } else {
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-danger"]
        });
      }
    });
  }
}
