import {
  Component,
  ViewChild,
  Input,
  OnInit,
  TemplateRef
} from "@angular/core";
import { LoginService, AdminService, LibraryService } from "../_services/index";
import { Router } from "@angular/router";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/modal-options.class";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "app-fancy",
  templateUrl: "./fancy.component.html",
  styleUrls: ["./fancy.component.scss"]
})
export class AddFancyComponent implements OnInit {
  public allGames: object;
  public subItemId: number;
  public subItemLoading: boolean = false;
  public subItem: object;
  public selectGame: object;
  public loading: boolean;
  public resultForm: FormGroup;
  public modalRef: BsModalRef;

  public intervalPlay: boolean;
  constructor(
    private loginService: LoginService,
    public adminService: AdminService,
    private modalService: BsModalService,
    public snackBar: MatSnackBar
  ) { }

  public ngOnInit() {
    this.selectGame = {};

    //Check Token
    IntervalObservable.create(5000)
      .takeWhile(() => this.intervalPlay)
      .subscribe(() => {
        this.adminService.checkToken().subscribe(data => {
          if (data.status != 1) {
            this.loginService.adminLogout();
            window.location.href = "/fancy";
            this.intervalPlay = false;
          }
        });
      });

    //New Deler
    this.resultForm = new FormGroup({
      winner: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required)
    });

    this.getFancyGames()
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  getFancyGames() {
    this.adminService.getAllFancyGames().subscribe(data => {
      this.allGames = data
    });
  }

  openFancy(gId) {
    this.subItemId = gId
    this.subItemLoading = true
    this.adminService.getAllFancy(gId).subscribe(data => {
      this.subItem = data
      this.subItemLoading = false
    });
  }

  addFancyLotus(gId, mId, pmId, Name) {
    this.subItemLoading = true
    this.adminService.addFancyLotus(gId, mId, pmId, Name).subscribe(data => {
      if (data.success) {
        this.snackBar.open('success', undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
        this.openFancy(gId)
        this.subItemLoading = false
      }
    });
  }

  updateGame(val, game_id) {
    if (val == "result") {
      return;
    }
    this.adminService.getUpdGamesNew(val, game_id).subscribe(data => {
      if (data.status == 1) {
        this.selectGame[game_id] = String(data.data.game_status);
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
      } else {
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
      }
    });
  }

  onSubmitResultForm(from, gameId, gsid) {
    this.adminService.getFancyResult(from, gameId, gsid).subscribe(data => {
      if (data.status == 1) {
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-success"]
        });
        this.modalRef.hide();
        this.loading = false;
      } else {
        this.snackBar.open(data.error, undefined, {
          duration: 3000,
          extraClasses: ["alert-danger"]
        });
        this.loading = false;
      }
    });
  }
}
