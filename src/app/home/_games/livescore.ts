import { Component, Input, OnInit } from "@angular/core";
import { HomeService, LibraryService } from "../../_services/index";

@Component({ selector: "app-livescore", templateUrl: "./livescore.html" })
export class LivescoreComponent implements OnInit {
  @Input() eventTypeId
  @Input() marketId
  public inPlayService
  public scoreTab: boolean
  public tabToggle: object
  public lotusBoj: any
  public deviceInfo: string

  constructor(private homeService: HomeService, private libraryService: LibraryService) { }

  public ngOnInit() {
    this.scoreTab = true
    this.tabToggle = {}
    this.tabToggle["ball"] = true

    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"));
    this.deviceInfo = preferenceVal.deviceInfo;

  }

  getLiveScore() {
    this.inPlayService = this.homeService.getScoreResponse(this.eventTypeId)
    this.lotusBoj = this.libraryService.getScoreTotalVal(this.marketId)
  }

  openScoreTab() {
    if (this.scoreTab) {
      this.scoreTab = false
    } else {
      this.scoreTab = true
    }

  }

  openTabs(id) {
    this.tabToggle = {};
    this.tabToggle[id] = true;
  }

}
