import { Component, Input, Output, OnInit, ViewChild, AfterViewChecked, EventEmitter, ChangeDetectorRef } from "@angular/core"
import { HomeService, LibraryService } from "../../_services/index"
import { SharedGameDetails, GameInfo } from "../../_services/gamedetail.service"
import { Observable } from "rxjs/Observable"
import { DragScroll } from "angular2-drag-scroll"
import { IntervalObservable } from "rxjs/observable/IntervalObservable"

import { HomeComponent } from "../home.component"
declare var require: any
@Component({
  selector: "app-games",
  templateUrl: "./games.html"
  // template: function () {
  //   let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"))
  //   if (preferenceVal.deviceInfo == 'destopView') {
  //     return require("./games.html")
  //   }
  //   else {
  //     return require("./gamesMobile.html")
  //   }
  // }()
})
export class GamesComponent implements OnInit {
  @Input() gameDetailListObject: GameInfo[]
  @Input() inPlayService
  @Output() closeGameEmitter: EventEmitter<number>
  public objectKeys = Object.keys
  public inPlay: any
  public deviceInfo: string
  public intervalPlay: boolean
  public favoriteGames: any
  public toggle: object
  public oddsDetailObj: object
  public gameLoader: boolean
  public parentGame: any
  public tabToggle: object
  public tempGameId: number
  public tempMatchOpt: number[] = []
  @ViewChild("gameTab", { read: DragScroll })
  ds: DragScroll
  public dragScroll: DragScroll
  public leftNavDisabled = false
  public rightNavDisabled = false
  public normalGames: any[] = []
  public otherGamesFancy: any[] = []
  @Input() closeGamesStatus

  constructor(
    public homeService: HomeService,
    public libraryService: LibraryService,
    private homeCom: HomeComponent,
    private cdRef: ChangeDetectorRef,
    private sharedGameDetais: SharedGameDetails,
    private cdr: ChangeDetectorRef
  ) {
    this.toggle = {}
    this.closeGameEmitter = new EventEmitter<number>()
  }

  public ngAfterViewChecked() {
    this.gameLoader = false
    this.cdRef.detectChanges()
  }

  checkGameStatus(id, mid, lgId, type) {
    let tempCheckGameStatus = this.homeService.getCloseGamesId(id, mid, lgId, type)
    if (tempCheckGameStatus && tempCheckGameStatus.bopt_main == 1) {
      setTimeout(() => {
        this.closeGmae(id)
      }, 10000)
    } else if (tempCheckGameStatus && tempCheckGameStatus.bopt_main == 0) {
      setTimeout(() => {
        this.openTabs(id, mid, lgId, type)
      }, 10000)
    }
  }

  // public
  public ngOnInit() {
    this.gameLoader = true
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"))
    this.deviceInfo = preferenceVal.deviceInfo

    // Mobile Tabs
    this.tabToggle = {}
    this.tabToggle["game"] = true


    // Asign Parent Game
    for (let item of this.gameDetailListObject) {
      if (item.boptMain == 1) {
        this.parentGame = item
        this.normalGames.push(item)
        this.tempMatchOpt.push(item.gameId)
        this.toggle[item.gameId] = true
        this.homeService.subscribeOdds(item.gameId, item.marketId, item.lotusGroupId, item.gameType)
        this.homeService.subscribeScoreLotus(item.marketId)
        this.tempGameId = item.gameId
      }
    }

    //Check Favorite
    this.favoriteGames = JSON.parse(localStorage.getItem("favoriteGames"))
  }

  // Mobile Tabs
  openShortTabs(id) {
    this.tabToggle = {}
    this.tabToggle[id] = true
  }

  oddsDetail() {
    this.oddsDetailObj = {}
    for (let item of this.otherGamesFancy) {
      this.homeService.getOdds(item.gameId).subscribe(data => {
        if (data.status == 1) {
          this.oddsDetailObj[item.gameId] = data.data.selections_pl
        }
      })
    }
  }

  // Check New Match Options
  newMatchOptions(gid) {
    let newMatchOpt = this.homeService.getMatchOptions(gid)
    if (newMatchOpt) {
      // If New Match Options Comes
      for (let item of newMatchOpt) {
        let newItem = {
          lotusGroupId: item.lotus_group_id,
          gameId: item.game_id,
          gameName: item.game_name,
          marketName: item.market_name,
          marketId: item.market_id,
          eventId: item.event_id,
          startTime: item.game_start,
          gameType: item.game_type,
          betOptions: []
        }

        if (this.tempMatchOpt.indexOf(newItem.gameId) == -1) {
          this.tempMatchOpt.push(newItem.gameId)
          if (newItem.gameType == -8 || newItem.gameType == -9) {
            this.otherGamesFancy.push(newItem)
            this.toggle[newItem.gameId] = true
            this.homeService.subscribeOdds(newItem.gameId, newItem.marketId, newItem.lotusGroupId, newItem.gameType)
            this.homeService.subscribeScoreLotus(newItem.marketId)
          } else {
            this.normalGames.push(newItem)
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
            if (item == itemObj.gameId) {
              this.toggle[itemObj.gameId] = false
              this.homeService.unSubscribeOdds(itemObj.gameId, itemObj.marketId, itemObj.lotusGroupId, itemObj.gameType)
              this.homeService.unSubscribeScoreLotus(itemObj.marketId)
              this.otherGamesFancy.splice(this.otherGamesFancy.indexOf(itemObj), 1)
            }
          }


          // Normal Game
          for (let itemObj of this.normalGames) {
            if (item == itemObj.gameId) {
              this.toggle[itemObj.gameId] = false
              this.homeService.unSubscribeOdds(itemObj.gameId, itemObj.marketId, itemObj.lotusGroupId, itemObj.gameType)
              this.homeService.unSubscribeScoreLotus(itemObj.marketId)
              this.normalGames.splice(this.normalGames.indexOf(itemObj), 1)
            }
          }

        }
      }
    }
  }


  moveLeft() {
    this.ds.moveLeft()
  }

  moveRight() {
    this.ds.moveRight()
  }

  leftBoundStat(reachesLeftBound: boolean) {
    this.leftNavDisabled = reachesLeftBound
  }

  rightBoundStat(reachesRightBound: boolean) {
    this.rightNavDisabled = reachesRightBound
  }

  openTabs(id, mid, lgId, type) {
    if (this.toggle[id]) {
      this.homeService.unSubscribeOdds(id, mid, lgId, type)
      this.homeService.unSubscribeScoreLotus(mid)
      delete this.toggle[id]
      return
    }

    // For Mobile
    if (this.deviceInfo == 'mobileView') {
      let key = Object.keys(this.toggle)
      this.homeService.unSubscribeOdds(key[0], mid, lgId, type)
      this.homeService.unSubscribeScoreLotus(mid)
      delete this.toggle[key[0]]
    }

    this.homeService.subscribeOdds(id, mid, lgId, type)
    this.homeService.subscribeScoreLotus(mid)
    this.toggle[id] = true
    this.tempGameId = id
  }

  favoriteTogel(gameId) {
    this.favoriteGames = JSON.parse(localStorage.getItem("favoriteGames"))
    if (gameId in this.favoriteGames) {
      delete this.favoriteGames[gameId]
    } else {
      this.favoriteGames[gameId] = true
    }
    localStorage.setItem("favoriteGames", JSON.stringify(this.favoriteGames))
  }

  closeGmae(gameId) {
    this.closeGameEmitter.emit(gameId)
    //TODO:add event ids also in shared
    this.sharedGameDetais.DeactivateEvent(this.gameDetailListObject[0].eventId)
    for (let gameInfo of this.gameDetailListObject) {
      this.homeService.unSubscribeOdds(gameInfo.gameId, gameInfo.marketId, gameInfo.lotusGroupId, gameInfo.gameType)
      this.homeService.unSubscribeScoreLotus(gameInfo.marketId)
    }
  }
}