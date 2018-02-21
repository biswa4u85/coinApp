import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response } from "@angular/http";

import { environment } from "../../environments/environment";
import { LibraryService } from "../_services/library.service";

import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

import "rxjs/add/operator/takeWhile";

declare let io: any;

@Injectable()
export class BoardService {
  private socket;
  public tempGids: number[] = [];
  constructor(private http: Http, private libraryService: LibraryService) {
    this.socket = io.connect(environment.socketUrl, {
      reconnect: true,
      port: environment.port,
      // 'secure': true,
      "max reconnection delay": 3000,
      "reconnection delay": 100,
      "max reconnection attempts": 1000
    });
    let self = this;
    this.socket.on("reconnect", function(type, number) {
      //Subscribe all open games
      for (let item of self.tempGids) {
        self.subscribeOdds(item);
      }
    });
  }

  //Check Game Active
  checkGameActive(game_id: number) {
    let options = {
      params: {
        token: this.libraryService.boardToken(),
        game_id: game_id
      }
    };
    return this.http
      .get(environment.apiUrl + "check_game_active", options)
      .map((response: Response) => response.json());
  }

  //Upd Fancy Status
  updFancyStatus(event_type_id: number, market_id: number, status: number) {
    let options = {
      params: {
        token: this.libraryService.boardToken(),
        event_type_id: event_type_id,
        market_id: market_id,
        status: status
      }
    };
    return this.http
      .get(environment.apiUrl + "upd_fancy_status", options)
      .map((response: Response) => response.json());
  }

  //Upd Fancy Odds
  updFancyOdds(game_id: number, fancy_odds: number) {
    let options = {
      params: {
        token: this.libraryService.boardToken(),
        game_id: game_id,
        fancy_odds: fancy_odds
      }
    };
    return this.http
      .get(environment.apiUrl + "upd_fancy_odds", options)
      .map((response: Response) => response.json());
  }

  //Save Result Session
  saveResultSession(game_id: number, gsid: number, run: number, pwd: string) {
    let options = {
      params: {
        token: this.libraryService.boardToken(),
        game_id: game_id,
        gsid: gsid,
        run: run,
        pwd: pwd
      }
    };
    return this.http
      .get(environment.apiUrl + "save_result_session", options)
      .map((response: Response) => response.json());
  }

  subscribeOdds(gid) {
    this.socket.emit("subscribe_odds", {
      token: this.libraryService.boardToken(),
      gid: gid
    });
  }

  unSubscribeOdds(gid) {
    this.socket.emit("unsubscribe_odds", {
      token: this.libraryService.boardToken(),
      gid: gid
    });
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
}
