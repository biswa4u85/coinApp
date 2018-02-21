import { Component, ViewChild, Input, Output, OnInit, TemplateRef, EventEmitter, ChangeDetectorRef, AfterViewInit } from "@angular/core"
import { LoginService, HomeService, LibraryService } from "../_services/index"
import { Router } from "@angular/router"
import { LocalStorageService, SessionStorageService } from "ngx-webstorage"
import { inPlayFilterPipe } from "../_pipe/index"
import { SharedGameDetails, MatchedUnmatchedBets, Bets, GameEvent, Game, Selection, GameInfo } from "../_services/gamedetail.service"
import { Observable } from "rxjs/Observable"
import { IntervalObservable } from "rxjs/observable/IntervalObservable"
import { Http, Headers, RequestOptions, Response, URLSearchParams } from "@angular/http"
import { BsModalService } from "ngx-bootstrap/modal"
import { BsModalRef } from "ngx-bootstrap/modal/modal-options.class"
import { BehaviorSubject } from "rxjs/BehaviorSubject"

import { environment } from "../../environments/environment"
import { transformMenu } from "@angular/material/menu/typings/menu-animations"

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  providers: [SharedGameDetails]
})
export class HomeComponent implements OnInit {
  @Output() myBetStatus: EventEmitter<string> = new EventEmitter<string>()
  public balance: any
  public exposure: any
  public ticker: string
  public currentUser: string
  public inPlay: boolean
  public filterFavId: object
  public lastUnmatchedBetTime: number
  public lastMatchedBetTime: Date
  public lastMatchedBetId: number
  public lastPlTime: Date
  public unmatchBetExist: boolean
  public allGames: object
  public gameStatus: boolean = false
  public favGames: number[]
  public favGamesIds: number[]
  public gameIds: Array<any>
  public tempGameIds: number[] = []
  public eventIds: object
  public oneAtATime: boolean
  public isopen: boolean
  public eventIdsString: string
  public inPlayService: any
  public inPlayGames: any[]
  public homeGameIds: object
  public homeGameDet: any[]
  public inPlayGamesInterval: boolean
  public isCollapsedMyBets: boolean = true
  public isCollapsedReport: boolean = true
  public collapsed(event: any): void { }
  public expanded(event: any): void { }
  public stakeVal: number
  public quickStake1: number
  public quickStake2: number
  public quickStake3: number
  public quickStake4: number
  public quickStake5: number
  public quickStake6: number
  public confirm: boolean
  public datasever: boolean
  public betOptions: string
  public theme: string
  public deviceInfo: string
  public searchGame: string
  public mobilemenu: boolean
  public intervalPlay: boolean
  public selectedOption: string
  public modalRef: BsModalRef
  public objectKeys = Object.keys
  public currentActiveEventIds: any[] = []
  public currentActiveMarketIds: any[] = []
  public liveTV: boolean = false

  constructor(
    private http: Http,
    private modalService: BsModalService,
    private router: Router,
    private loginService: LoginService,
    private homeService: HomeService,
    public libraryService: LibraryService,
    private sessionStore: SessionStorageService,
    public sharedGameDetails: SharedGameDetails,
    private cdr: ChangeDetectorRef
  ) {
    this.oneAtATime = true
    this.intervalPlay = true
    this.gameIds = []
    this.eventIds = {}
    this.inPlay = false
    this.inPlayService = ""
    this.inPlayGamesInterval = true
    this.myBetStatus.emit("Click from nested component")
    this.lastMatchedBetId = 0
    this.lastMatchedBetTime = new Date(0)
    this.lastUnmatchedBetTime = 0
    this.unmatchBetExist = false
    this.lastPlTime = new Date(0)
  }

  public ngOnInit() {

    //Check Token
    IntervalObservable.create(5000).takeWhile(() => this.intervalPlay).subscribe(() => {
      this.homeService.checkToken().subscribe(data => {
        if (data.status != 1) {
          this.loginService.logout()
          window.location.href = "/login"
          this.intervalPlay = false
        }
      })
    })

    //Set Theme And One Click Bet
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"))
    this.stakeVal = preferenceVal.stakeVal
    this.quickStake1 = preferenceVal.quickStake1
    this.quickStake2 = preferenceVal.quickStake2
    this.quickStake3 = preferenceVal.quickStake3
    this.quickStake4 = preferenceVal.quickStake4
    this.quickStake5 = preferenceVal.quickStake5
    this.quickStake6 = preferenceVal.quickStake6
    this.datasever = preferenceVal.datasever
    this.deviceInfo = preferenceVal.deviceInfo
    if (preferenceVal.betOptions == "oneclickbet") {
      preferenceVal.betOptions = "normal"
      this.betOptions = "normal"
      localStorage.setItem("preferenceVal", JSON.stringify(preferenceVal))
    } else {
      this.betOptions = preferenceVal.betOptions
    }
    this.theme = preferenceVal.theme

    //Current User
    let userDetails: any = JSON.parse(
      this.sessionStore.retrieve("userDetails")
    )
    if (userDetails) {
      this.currentUser = userDetails.data.username
    }

    //Check Balance
    //TODO: call balance on drawer click and bets response
    this.totalBalance()
    this.totalExposure()

    //Socket Data
    this.homeService.getSocketOdds().subscribe(data => {
      this.libraryService.showSocketData(data)
    })

    this.homeService.getSocketLotusOdds().subscribe(data => {
      this.libraryService.showSocketDataLotus(data)
    })

    //Home Page games
    this.homeInPlayGames()
    this.startScoreInterval()
  }

  idToTrackCategoriesWith(index, item) {
    return item.cat_name
  }

  idToTrackGamesWith(index, item) {
    return item.game_id
  }

  trackByTennisScore(index, item) {
    return item
  }

  handleBetsStatus() {
    this.myBetStatus.emit("Click from nestedfdsf")
  }

  public pageRefresh() {
    window.location.reload()
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }

  totalBalance() {
    this.homeService.getBalance().subscribe(data => {
      if (data.status == 1) {
        let temData = Number(data.data.balance).toFixed(2)
        this.balance = temData
      }
    })
  }

  totalExposure() {
    this.homeService.getExposure().subscribe(data => {
      if (data.status == 1) {
        let temData = Number(data.data.tot_exposure).toFixed(2)
        this.exposure = temData
      }
    })
  }

  getGamesNew() {
    this.gameStatus = false
    let self = this
    this.homeService.getGames().subscribe(data => {
      let tempGame = this.libraryService.CreateGameIdWiseGames(data.data.games)
      self.allGames = this.libraryService.CreateCategoryWiseGames(tempGame)
      self.gameStatus = false
      // Favorite Games
      this.favGames = data.data.games
      this.favGamesIds = []
      let favoriteGames = JSON.parse(localStorage.getItem("favoriteGames"))
      for (let itom in favoriteGames) {
        this.favGamesIds.push(Number(itom))
      }
      this.filterFavId = {
        game_id: {
          $or: this.favGamesIds
        }
      }
    })

    this.totalExposure()
    this.totalBalance()
  }

  //Home Page games
  //TODO:get games ke response me tree bana ke rakh do jaanu
  homeInPlayGames() {
    let self = this
    this.homeService.getGamesForHomepage().subscribe(data => {
      this.processGameData(data)
      for (let item of data.data.games_info) {
        if (item.bopt_main == 1 && this.tempGameIds.indexOf(item.game_id) == -1) {
          this.tempGameIds.push(item.game_id)
        }
      }


      //Start Interval Calls for
      IntervalObservable.create(1000).subscribe(() => {
        let gameIds = []
        this.currentActiveEventIds = []
        this.currentActiveMarketIds = []
        for (let eventId in this.sharedGameDetails.currentActiveGamesEventWise) {
          this.currentActiveEventIds.push(eventId)
          for (let gameInfo of this.sharedGameDetails.currentActiveGamesEventWise[eventId]) {
            gameIds.push(gameInfo.gameId)
            if (gameInfo.gameType == 4) {
              this.currentActiveMarketIds.push(gameInfo.marketId)
            }
          }
        }

        if (!(gameIds.length == 0)) {

          // Chech Match Unmatch Bets
          this.homeService.getBetsData(this.lastMatchedBetId, this.lastUnmatchedBetTime, JSON.stringify(gameIds), this.lastPlTime).subscribe(data => {
            this.processGameData(data)
          })

        }
        if (!(this.tempGameIds.length == 0)) {
          // Chech Match Options
          this.homeService.getMatchoptionsGidsApi(JSON.stringify(this.tempGameIds)).subscribe(data => {
            if (data.status == 1) {
              this.homeService.setMatchOptions(data.data.games)
            }
          })
        }

      })
    })
  }

  private processGameData(data) {
    if (data.status == 1) {
      if (data.data) {
        let temphomeGamesInfo = data.data.games_info
        let incomingUnmatchedBets = data.data.unmatched
        let incomingMatchedBets = data.data.matched
        let profitLossArray = data.data.profitloss

        let betsAray = []

        if (incomingUnmatchedBets) {
          for (let unmatchBet of incomingUnmatchedBets) {
            if (unmatchBet.lasttime_details > this.lastUnmatchedBetTime) {
              this.lastUnmatchedBetTime = unmatchBet.lasttime_details
            }

            unmatchBet.isUnmatched = true
            betsAray.push(unmatchBet)
          }
        }

        if (incomingMatchedBets) {
          for (let matchBet of incomingMatchedBets) {
            if (new Date(matchBet.bettime) > this.lastMatchedBetTime) {
              this.lastMatchedBetTime = new Date(matchBet.bettime)
              this.lastMatchedBetId = matchBet.bet_id
            }

            matchBet.isUnmatched = false
            betsAray.push(matchBet)
          }
        }

        if (!this.sharedGameDetails.eventIdWiseDetails) {
          this.sharedGameDetails = new SharedGameDetails()
        }

        if (temphomeGamesInfo) {
          for (let gameInfo of temphomeGamesInfo) {
            let eventId = gameInfo.event_id
            let currentEventIdExist = this.sharedGameDetails.currentActiveEvents.includes(eventId)
            if (!currentEventIdExist) {
              this.sharedGameDetails.currentActiveEvents.push(eventId)
              this.sharedGameDetails.currentActiveGamesEventWise[eventId] = [new GameInfo(gameInfo)]
            } else {
              let currentGames = this.sharedGameDetails.currentActiveGamesEventWise[eventId]
              let currentGameExist = currentGames.find(x => x.gameId == gameInfo.game_id)
              if (!currentGameExist) {
                this.sharedGameDetails.currentActiveGamesEventWise[eventId].push(new GameInfo(gameInfo))
              }
            }

            this.sharedGameDetails.gameIdEventIdMapping[gameInfo.game_id] = gameInfo.event_id
          }
        }

        this.sharedGameDetails.Update(betsAray)

        // Process profit loss and save
        if (profitLossArray) {
          for (let profitLoss of profitLossArray) {
            let gameId: number = profitLoss.game_id
            let selectionId = profitLoss.gsel_id
            let profit = profitLoss.pl

            let lastPlTime = new Date(profitLoss.updatetime)
            if (lastPlTime > this.lastPlTime) {
              this.lastPlTime = lastPlTime
            }

            let oldProfit = SharedGameDetails.selWisePl[selectionId]
            if (oldProfit) {
              let newProfit = Number(profit)
              if (!(oldProfit == newProfit)) {
                SharedGameDetails.selWisePl[selectionId] = Number(newProfit).toFixed(2)
              }
            } else {
              SharedGameDetails.selWisePl[selectionId] = Number(profit).toFixed(2)
            }
          }
        }
      }
    }

    // this.cdr.reattach()
  }

  //Call Live Score
  startScoreInterval() {
    IntervalObservable.create(5000).takeWhile(() => this.inPlayGamesInterval).subscribe(() => {
      let eventIdsString = ""
      for (let item of this.currentActiveEventIds) {
        eventIdsString = item + "," + eventIdsString
      }
      eventIdsString = eventIdsString.slice(0, -1)
      if (eventIdsString) {
        this.homeService.getInPlayService(eventIdsString).subscribe(data => {
          this.homeService.saveScoreResponse(data, this.currentActiveEventIds)
        })
      }
    })

    this.homeService.getSocketScore().subscribe(data => {
      this.libraryService.setCommentryTotalVal(data)
    })

    this.homeService.getSocketScoreLotus().subscribe(data => {
      this.libraryService.setScoreTotalVal(data)
    })

  }

  changeBet(val) {
    this.betOptions = val
    localStorage.setItem("preferenceVal", JSON.stringify({
      stakeVal: this.stakeVal,
      quickStake1: this.quickStake1,
      quickStake2: this.quickStake2,
      quickStake3: this.quickStake3,
      quickStake4: this.quickStake4,
      quickStake5: this.quickStake5,
      quickStake6: this.quickStake6,
      betOptions: this.betOptions,
      datasever: this.datasever,
      theme: this.theme
    })
    )
  }

  closeGameFromGameComponent(event: Event) {
    // TODO shared wale me update karna hai delete this.gameIds[event[0]] delete
    // this.eventIds[event[1]]
  }

  liveTVTogel() {
    if (this.liveTV) {
      this.liveTV = false
    } else {
      this.liveTV = true
    }
  }

  getCloseGame(gId) {
    this.tempGameIds.splice(this.tempGameIds.indexOf(gId), 1)
  }

  openGameFromTree(gameId: number) {
    if (this.tempGameIds.indexOf(gameId) == -1) {
      this.tempGameIds.push(gameId)
    }
    //Check Game Count
    let eventId = this.sharedGameDetails.gameIdEventIdMapping[gameId]
    if (eventId) {
      let currentActiveGames = this.sharedGameDetails.currentActiveGamesEventWise[eventId]
      if (currentActiveGames) {
        let curretGameExist = currentActiveGames.find(x => x.gameId == gameId)
        if (curretGameExist) {
          alert("Already added!")
        } else if (currentActiveGames.length == 1) {
          alert("Already 6 games added!")
        } else {
          this.homeService.getOneTimeBets([gameId]).subscribe(data => {
            this.processGameData(data)
          })
        }
      } else {
        this.homeService.getOneTimeBets([gameId]).subscribe(data => {
          this.processGameData(data)
        })
      }
    } else {
      this.homeService.getOneTimeBets([gameId]).subscribe(data => {
        this.processGameData(data)
      })
    }
  }
}