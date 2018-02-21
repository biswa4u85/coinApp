import { Component, ViewChild, Input, Output, OnInit, TemplateRef, EventEmitter, ChangeDetectorRef, AfterViewInit } from "@angular/core"
import { LoginService, LibraryService } from "../_services/index"
import { Router } from "@angular/router"
import { LocalStorageService, SessionStorageService } from "ngx-webstorage"
import { inPlayFilterPipe } from "../_pipe/index"
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
  templateUrl: "./home.component.html"
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
    public libraryService: LibraryService,
    private sessionStore: SessionStorageService,
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


  }



}