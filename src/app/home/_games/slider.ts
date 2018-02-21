import {
  Component,
  Input,
  OnInit,
  ViewChild,
  TemplateRef,
  ViewChildren
} from "@angular/core";
import { HomeService, LibraryService } from "../../_services/index";
import { DragScroll } from "angular2-drag-scroll";
import { SharedGameDetails } from "../../_services/gamedetail.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/modal-options.class";

import { Observable } from "rxjs/Observable";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { HomeComponent } from "../home.component";

@Component({
  selector: "app-slider",
  templateUrl: "./slider.html"
})
export class SliderComponent implements OnInit {
  @Input() gameId;
  @Input() gSelid;
  @Input() type;
  @Input() eventId;
  @Input() consolidate;

  @ViewChild("nav", { read: DragScroll })
  ds: DragScroll;
  public dragScroll: DragScroll;
  public cancelbetLoading: boolean = false;
  public leftNavDisabled = false;
  public rightNavDisabled = false;
  public modalRef: BsModalRef;

  constructor(
    public homeService: HomeService,
    public libraryService: LibraryService,
    private homeComponent: HomeComponent,
    private modalService: BsModalService,
    public sharedGameDetails: SharedGameDetails
  ) { }

  get UBets() {
    return SharedGameDetails.selWiseUBets[this.gSelid] ? SharedGameDetails.selWiseUBets[this.gSelid] : [];
  }
  get MBets() {
    if (this.consolidate) {
      return SharedGameDetails.selWiseMBets[this.gSelid] ? this.libraryService.consolidateBets(SharedGameDetails.selWiseMBets[this.gSelid]) : [];
    } else {
      return SharedGameDetails.selWiseMBets[this.gSelid] ? SharedGameDetails.selWiseMBets[this.gSelid] : [];
    }
  }

  public ngOnInit() { }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  moveLeft() {
    this.ds.moveLeft();
  }

  moveRight() {
    this.ds.moveRight();
  }

  leftBoundStat(reachesLeftBound: boolean) {
    this.leftNavDisabled = reachesLeftBound;
  }

  rightBoundStat(reachesRightBound: boolean) {
    this.rightNavDisabled = reachesRightBound;
  }

  public trackByBetId(index, item) {
    return item.bet_id;
  }

  public cancelBets(bid: number) {
    this.homeService.cancelBet(bid).subscribe(data => {
      this.cancelbetLoading = true;
      if (data.status == 1) {
        this.sharedGameDetails.CancelBet(
          data.game_id,
          data.bet_id,
          this.gSelid
        );
      }
    });
  }
}
