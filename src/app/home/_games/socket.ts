import { Component, Input, OnInit, Output, TemplateRef, EventEmitter, ChangeDetectorRef, ViewChild } from "@angular/core"
import { HomeService, LibraryService } from "../../_services/index"
import { SharedGameDetails, MatchedUnmatchedBets, Bets, GameInfo } from "../../_services/gamedetail.service"
import { Observable } from "rxjs/Observable"
import { IntervalObservable } from "rxjs/observable/IntervalObservable"
import { Ng2DeviceService } from "ng2-device-detector"
import { BsModalService } from "ngx-bootstrap/modal"
import { BsModalRef } from "ngx-bootstrap/modal/modal-options.class"
import { HomeComponent } from "../home.component"
declare var require: any

@Component({
  selector: "app-socket",
  templateUrl: "./socket.html"
})
export class SocketComponent implements OnInit {
  @Input() gameDetails: GameInfo
  public marketName: string
  public deviceInfo: string
  public oddsDetail
  public favoriteGames: any;
  public matchedBets: object
  public unMatchedBets: object
  public oddBox: object
  public betDetails: object
  public tabToggle: object
  public matchOdds: object = {}
  public matchOddsSideBar: object = {}
  public currentBet
  public chnageStakeVal: number
  public stakeVal: number
  public clockStatus: string
  public clockStatusInterval: boolean
  public matchUmatchCount: object = {}
  public activeBet: object = {}
  public sayTextInterval: boolean
  public modalRef: BsModalRef
  public consolidate: boolean = true
  public tempMBetsCount: number = 0
  public tempUBetsCount: number = 0

  constructor(
    private homeService: HomeService,
    private homeComponent: HomeComponent,
    private libraryService: LibraryService,
    private deviceService: Ng2DeviceService,
    private modalService: BsModalService,
    public sharedGameDetails: SharedGameDetails,
    private cdr: ChangeDetectorRef
  ) {
    this.oddBox = [0, 1, 2]
    this.betDetails = {}
  }

  UBets(selid) {
    let tempUBets = SharedGameDetails.selWiseUBets[selid]
    if (tempUBets && this.tempUBetsCount !== tempUBets.length) {
      this.tempUBetsCount = tempUBets.length
      // this     .homeComponent     .totalBalance() this     .homeComponent
      // .totalExposure()
    }

    return tempUBets ? tempUBets.length : 0
  }
  MBets(selid) {
    let tempMBets = SharedGameDetails.selWiseMBets[selid]
    if (tempMBets && this.tempMBetsCount !== tempMBets.length) {
      this.tempMBetsCount = tempMBets.length
      // this     .homeComponent     .totalBalance() this     .homeComponent
      // .totalExposure()
    }
    return tempMBets ? tempMBets.length : 0
  }

  get getProfit() {
    return SharedGameDetails.selWisePl ? SharedGameDetails.selWisePl : 0
  }

  public update() {
    this.cdr.detectChanges()
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }

  public ngOnInit() {

    //Device Info
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"))
    this.deviceInfo = preferenceVal.deviceInfo

    this.tabToggle = {}
    if (this.deviceInfo == 'destopView') {
      this.tabToggle["matched"] = true
    } else {
      this.tabToggle["game"] = true
    }


    // Get Odds
    this.homeService.getOdds(this.gameDetails.gameId).subscribe(data => {
      if (data.status == 1) {
        this.oddsDetail = data.data.selections
      }
    })
    this.sayTextInterval = true
    this.sayText()
  }

  sayText() {
    IntervalObservable.create(5000).takeWhile(() => this.sayTextInterval).subscribe(() => {
      let orgmusicValue = ""
      let musicValue

      let oldMusicValue = ""

      // this.libraryService.search(nameKey, myArray) {     for (var i = 0 i <
      // myArray.length i++) {         if (myArray[i].name === nameKey) { return i }
      //     } }

      let voices = window.speechSynthesis.getVoices()
      // var resultObject = search("Google हिन्दी", voices)

      if (oldMusicValue != musicValue) {
        oldMusicValue = musicValue

        let support = false
        if (window.speechSynthesis) {
          support = true
        }

        var config = {
          // voice:
          pitch: 1, rate: 1, volume: 1
        }
        //console.log(musicValue)
        if (window.speechSynthesis) {
          // speech.sayText(musicValue, config)
        }
      }
    })
  }

  favoriteTogel(gameId) {
    this.favoriteGames = JSON.parse(localStorage.getItem("favoriteGames"))
    if (gameId in this.favoriteGames) {
      delete this.favoriteGames[gameId]
    } else {
      this.favoriteGames[gameId] = true;
    }
    localStorage.setItem("favoriteGames", JSON.stringify(this.favoriteGames))
  }

  openTabs(id) {
    this.tabToggle = {}
    this.tabToggle[id] = true
  }

  trackByBetId(index, item) {
    return item.bet_id
  }

  cancelBets(bid: number) {
    this.homeService.cancelBet(bid).subscribe(data => {
      if (data.status == 1) {
        this.sharedGameDetails.CancelBet(data.game_id, data.bet_id)
      }
    })
  }

  closeGame(panel) {
    // delete this.sharedGameDetails.listOfOpenGames[this.gameDetails.game_id]
    // panel.classList.toggle("collapse")
  }

  public getCloseBet(): void {
    this.currentBet = ""
    this.matchOdds = {}
    this.matchOddsSideBar = {}
  }

  getTempProfitVal(id: any) {
    let orgVal = this.getProfit[id] ? this.getProfit[id] : 0
    let calcVal = this.homeService.getTempProfit(id)
    if (calcVal) {
      return (Number(calcVal) + Number(orgVal)).toFixed(2)
    }
  }

  public openBets = (prefix, parentIndex, i, item) => {
    let orgPrice = document.getElementById(prefix + this.gameDetails.gameId + "_" + item.gselid_bf + "_" + i + "_price").innerHTML;
    let orgAmount = document.getElementById(prefix + this.gameDetails.gameId + "_" + item.gselid_bf + "_" + i + "_amount").innerHTML;

    let selectName: string;
    let gSellIds: any[] = [];
    for (let item of this.oddsDetail) {
      gSellIds.push(item.gselid);
      if (item.gselid == item.gselid) {
        selectName = item.gselname;
      }
    }
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"));
    this.betDetails = {
      gid: this.gameDetails.gameId,
      gsid: item.gselid,
      type: this.gameDetails.gameType,
      orgPrice: orgPrice,
      orgAmount: orgAmount,
      bType: prefix,
      game_name: this.gameDetails.gameName,
      selectName: selectName,
      defultStakeVal: preferenceVal.stakeVal,
      gSellIds: gSellIds
    };
    if (preferenceVal.betOptions == "oneclick") {
      this.homeService.newPlaceBetAll(this.betDetails);
    } else {
      this.matchOdds = {}
      this.homeService.setTempPrefit(gSellIds, item.gselid, '', null, null)

      if (this.deviceInfo == "mobileView") {
        //Mobile Scroll
        let element = document.getElementById(
          "element_" + this.gameDetails.gameId + "_" + item.gselid
        );
        this.homeService.setMobileTabActive(item.gselid + "act_" + i);
        element.scrollIntoView({ behavior: "smooth" });
      } else {

        //Destop on DobleClick Close Bet Box
        if (this.currentBet === "bet_" + parentIndex + i + item.gselid_bf) {
          this.currentBet = "";
          return;
        }
      }

      this.matchOdds[prefix + parentIndex + "_" + i] = true;
      this.currentBet = "bet_" + parentIndex + i + item.gselid_bf;
      this.homeService.setPlaceBetValue(this.betDetails);
      this.cdr.detectChanges();
    }
  }
}
