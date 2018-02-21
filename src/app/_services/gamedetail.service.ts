import { Injectable } from "@angular/core";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";

@Injectable()
export class SharedGameDetails {
  public currentActiveEvents: Number[];
  public currentActiveGamesEventWise: {
    [id: number]: GameInfo[];
  };
  public eventIdWiseDetails: {
    [id: number]: GameEvent;
  } = {};
  public inPlayGamesInterval: boolean;
  public inPlayService: object;
  public static socketComponenct = {};
  public static sliderComponenct = {};
  public static selWisePl = {};
  public static selWiseUBets = {};
  public static selWiseMBets = {};
  public gameIdEventIdMapping: {
    [id: number]: number;
  } = {};
  constructor() {
    this.eventIdWiseDetails = {};
    this.gameIdEventIdMapping = {};
    this.currentActiveEvents = [];
    this.currentActiveGamesEventWise = {};
    this.inPlayGamesInterval = true;
    this.inPlayService = {};
  }

  public CancelBet(gameId, betId, selId?) {
    if (selId) {
      if (SharedGameDetails.selWiseUBets[selId]) {
        let betExist = SharedGameDetails.selWiseUBets[selId].find(
          x => x.id == betId
        );
        if (betExist) {
          SharedGameDetails.selWiseUBets[
            selId
          ] = SharedGameDetails.selWiseUBets[selId].filter(x => x.id != betId);
        }
      }
    }

    let eventId = this.gameIdEventIdMapping[gameId];
    if (eventId) {
      let gameEvent = this.eventIdWiseDetails[eventId];
      if (gameEvent) {
        let game = gameEvent.games[gameId];
        if (game) {
          for (let selectionId in game.selections) {
            let selection = game.selections[selectionId];
            if (selection) {
              let unmatchedBets = selection.bets.unmatchedBets;
              let betExist = unmatchedBets.find(x => x.id == betId);
              if (betExist) {
                let tempUnMatchedBets = unmatchedBets.filter(
                  x => x.id != betId
                );
                delete selection.bets.unmatchedBets;
                selection.bets.unmatchedBets = tempUnMatchedBets;
              }
            }
            if (
              selection.bets.matchedBets.length == 0 &&
              selection.bets.unmatchedBets.length == 0
            ) {
              // delete game.selections[selectionId]
            }
          }
        }
      }
    }
  }

  public DeactivateGame(gameId) {
    let eventId = this.gameIdEventIdMapping[gameId];
    if (eventId) {
      if (eventId in this.currentActiveGamesEventWise) {
        let tempGamesActiveArray = this.currentActiveGamesEventWise[
          eventId
        ].filter(x => x.gameId != gameId);
        if (tempGamesActiveArray.length == 0) {
          delete this.currentActiveGamesEventWise[eventId];
          this.DeactivateEvent(eventId);
        } else {
          delete this.currentActiveGamesEventWise[eventId];
          this.currentActiveGamesEventWise[eventId] = tempGamesActiveArray;
        }
      }
    }
  }

  public DeactivateEvent(eventId) {
    let gameEvent = this.eventIdWiseDetails[eventId];
    if (gameEvent) {
      delete this.eventIdWiseDetails[eventId];
    }

    if (eventId in this.currentActiveGamesEventWise) {
      delete this.currentActiveGamesEventWise[eventId];
    }

    let tempCurrentAvtiveEvents = this.currentActiveEvents.filter(
      x => x != eventId
    );
    delete this.currentActiveEvents;
    this.currentActiveEvents = tempCurrentAvtiveEvents;
  }

  // public GetProfit(eventId: number, gameId: number, selectionId: number) { let
  // returnProfit = 0     let gameEvent = this.eventIdWiseDetails[eventId] if
  // (gameEvent) {         let game = gameEvent.games[gameId]         if (game) {
  //            let selection = game.selections[selectionId]             if
  // (selection) {                 returnProfit = selection.profit             }
  //     }     }     return returnProfit } Get Match Unmatch Bets By Game Id
  // public GetBetsMatched(eventId: number, gameId: number, selectionId: number) {
  //     return this.GetBets(eventId, gameId, selectionId, false) } public
  // GetBetsUnmatched(eventId: number, gameId: number, selectionId: number) {
  // return this.GetBets(eventId, gameId, selectionId, true) }

  private GetBets(
    eventId: number,
    gameId: number,
    selectionId: number,
    isUnmatched: boolean
  ) {
    let returnBetArray = [];
    let gameEvent = this.eventIdWiseDetails[eventId];
    if (gameEvent) {
      let game = gameEvent.games[gameId];
      if (game) {
        let selection = game.selections[selectionId];
        if (selection) {
          if (isUnmatched) {
            returnBetArray = selection.bets.unmatchedBets;
          } else {
            returnBetArray = selection.bets.matchedBets;
          }
        }
      }
    }

    return returnBetArray;
  }

  //Incoming bets has both matched and unmatched
  public Update(incomingBets?: any, lastBetTime?: number) {
    if (incomingBets) {
      let tempEventIdWiseDetails: {
        [id: number]: Bets[];
      } = {};

      for (let incomingBet of incomingBets) {
        let bet = new Bets(incomingBet);
        let gameId = bet.gameId;
        let eventId = this.gameIdEventIdMapping[gameId];

        //If eventId doesent exist, TODO:bring eventid
        if (eventId) {
          if (eventId in tempEventIdWiseDetails) {
            tempEventIdWiseDetails[eventId].push(bet);
          } else {
            tempEventIdWiseDetails[eventId] = [bet];
          }
        }
      }

      for (let eventId in tempEventIdWiseDetails) {
        //If eventId doesent exist, game is not open so we can ignore the bets
        if (eventId in this.eventIdWiseDetails) {
          this.eventIdWiseDetails[eventId].Update(
            tempEventIdWiseDetails[eventId]
          );
        } else {
          this.eventIdWiseDetails[eventId] = new GameEvent(Number(eventId));
          this.eventIdWiseDetails[eventId].Update(
            tempEventIdWiseDetails[eventId]
          );
        }
      }
    }
  }
}

export class Bets {
  public id: number;
  public time: Date;
  public odds: number;
  public type: string;
  public stake: number;
  public consolidate_id: string;
  public gameId: number;
  public isUnmatched: boolean;
  public selectionId: number;

  constructor(bets) {
    this.id = bets.bet_id;
    this.time = bets.bettime;
    this.odds = bets.odds;
    this.type = bets.type;
    this.stake = bets.stake;
    this.consolidate_id = bets.consolidate_id;
    this.isUnmatched = bets.isUnmatched;
    this.gameId = bets.game_id;
    this.selectionId = bets.selid;
  }
}

export class MatchedUnmatchedBets {
  public matchedBets: Bets[];
  public unmatchedBets: Bets[];

  constructor(matchedBets?, unMatchedBets?) {
    this.matchedBets = [];
    this.unmatchedBets = [];

    if (matchedBets) {
      for (let matechedBet of matchedBets) {
        this.matchedBets.push(new Bets(matchedBets));
      }
    }

    if (unMatchedBets) {
      for (let unmatchedBet of unMatchedBets) {
        this.unmatchedBets.push(new Bets(unmatchedBet));
      }
    }
  }
}

export class Selection {
  public profit: number;
  public bets: MatchedUnmatchedBets;
  public selectionId: number;

  constructor(selectionId) {
    this.selectionId = selectionId;
    this.profit = 0;
    this.bets = new MatchedUnmatchedBets();
  }

  public Update(bets: Bets[]) {
    let tempUnMatchedBets: Bets[] = [];
    let tempMatchedBets: Bets[] = [];
    for (let bet of bets) {
      if (bet.isUnmatched) {
        tempUnMatchedBets.unshift(bet);
      } else {
        tempMatchedBets.unshift(bet);
      }
    }

    let currentBets = SharedGameDetails.selWiseMBets[this.selectionId];
    if (currentBets) {
      if (tempMatchedBets.length > 0) {
        let currentBetsNew = currentBets.slice(0).reverse();
        for (let bet of tempMatchedBets) {
          if (!currentBetsNew.find(x => x.id == bet.id)) {
            currentBetsNew.push(bet);
          }
        }
        SharedGameDetails.selWiseMBets[
          this.selectionId
        ] = currentBetsNew.reverse();
      }
    } else {
      SharedGameDetails.selWiseMBets[this.selectionId] = tempMatchedBets;
    }

    let currentUBets = SharedGameDetails.selWiseUBets[this.selectionId];
    if (currentUBets) {
      let currentUBetsNew = currentUBets.slice(0).reverse();

      if (tempUnMatchedBets.length > 0) {
        for (let bet of tempUnMatchedBets) {
          let betExist = currentUBetsNew.find(x => x.id == bet.id);

          if (betExist) {
            if (bet.stake == 0 || bet.stake == 0.0 || bet.stake == 0.0) {
              currentUBetsNew = currentUBetsNew.filter(x => x.id != bet.id);
            } else {
              if (
                betExist.odds == Number(bet.odds) &&
                betExist.stake == Number(bet.stake) &&
                betExist.time == bet.time
              ) {
              } else {
                betExist.odds = bet.odds;
                betExist.stake = bet.stake;
                betExist.time = bet.time;
              }
            }
          } else {
            if (bet.stake > 0) {
              currentUBetsNew.push(bet);
            }
          }
        }
        SharedGameDetails.selWiseUBets[
          this.selectionId
        ] = currentUBetsNew.reverse();
      }
    } else {
      SharedGameDetails.selWiseUBets[this.selectionId] = tempUnMatchedBets;
    }
  }
}

export class Game {
  public gameId: number;
  public selections: {
    [id: number]: Selection;
  };
  // gameComponentObject: any

  constructor(gameId: number) {
    this.gameId = gameId;
    this.selections = {};
    // this.gameComponentObject = null
  }

  public Update(bets: Bets[]) {
    // this.gameComponentObject.update()
    if (bets) {
      let tempSelectionWiseBets: {
        [id: number]: Bets[];
      } = {};
      for (let bet of bets) {
        let selectionId = bet.selectionId;
        if (selectionId in tempSelectionWiseBets) {
          tempSelectionWiseBets[selectionId].push(bet);
        } else {
          tempSelectionWiseBets[selectionId] = [bet];
        }
      }

      for (let selectionId in tempSelectionWiseBets) {
        if (selectionId in this.selections) {
          this.selections[selectionId].Update(
            tempSelectionWiseBets[selectionId]
          );
        } else {
          this.selections[selectionId] = new Selection(selectionId);
          this.selections[selectionId].Update(
            tempSelectionWiseBets[selectionId]
          );
        }
      }
    }
  }
}

export class GameInfo {
  lotusGroupId: number;
  gameId: number;
  gameName: string;
  eventId: number;
  startTime: Date;
  gameType: number;
  betOptions: GameInfo[];
  marketName: string;
  marketId: string;
  boptMain: number;

  constructor(gameInfo) {
    this.lotusGroupId = gameInfo.lotus_group_id;
    this.gameId = gameInfo.game_id;
    this.boptMain = gameInfo.bopt_main;
    this.gameName = gameInfo.game_name;
    this.marketName = gameInfo.market_name;
    this.marketId = gameInfo.market_id;
    this.eventId = gameInfo.event_id;
    this.startTime = gameInfo.game_start;
    this.gameType = gameInfo.game_type;
    this.betOptions = [];

    if (gameInfo.bet_option) {
      for (let betOption of gameInfo.bet_option) {
        this.betOptions.push(new GameInfo(gameInfo.bet_option));
      }
    }
  }
}

export class GameEvent {
  public eventId;
  public games: {
    [id: number]: Game;
  };

  constructor(eventId: number) {
    this.eventId = eventId;
    this.games = {};
  }

  public Update(bets: Bets[]) {
    let tempGameIdWiseBets: {
      [id: number]: Bets[];
    } = {};
    for (let bet of bets) {
      let gameId = bet.gameId;
      if (gameId in tempGameIdWiseBets) {
        tempGameIdWiseBets[gameId].push(bet);
      } else {
        tempGameIdWiseBets[gameId] = [bet];
      }
    }

    for (let gameId in tempGameIdWiseBets) {
      if (gameId in this.games) {
        this.games[gameId].Update(tempGameIdWiseBets[gameId]);
      } else {
        let newGame = new Game(Number(gameId));
        newGame.Update(tempGameIdWiseBets[gameId]);
        this.games[gameId] = newGame;
      }
    }
  }
}
