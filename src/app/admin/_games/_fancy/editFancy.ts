import { Component, OnInit, Input } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormArray,
  FormBuilder,
  Validators
} from "@angular/forms";
import { AdminService } from "../../../_services/index";
import { MatSnackBar } from "@angular/material";

@Component({ selector: "admin-editFancy", templateUrl: "./editFancy.html" })
export class EditFancyComponent implements OnInit {
  @Input() currentGame;
  public loading: boolean;
  public selectedValue: string;
  public scoreFancyForm: any;
  public rangeFancyForm: any;
  public scoreNumberForm: any;
  public oddEvenForm: any;
  public manualFancyForm: any;
  public settingFancyForm: any;
  public currentFancyStatus: number;
  public gameStatus: string;

  constructor(
    private adminService: AdminService,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar
  ) {
    this.loading = false;
  }

  ngOnInit() {
    this.adminService
      .checkGameActive(this.currentGame.game_id)
      .subscribe(data => {
        this.gameStatus = data.error;
      });

    this.currentFancyStatus = 3;

    this.scoreFancyForm = new FormGroup({
      type: new FormControl(this.currentGame.game_type),
      enterBets: new FormControl("", Validators.required)
    });
    this.getMaxbets();

    this.settingFancyForm = new FormGroup({
      opt: new FormControl("", Validators.required),
      val: new FormControl("", Validators.required),
      type: new FormControl(this.currentGame.game_type)
    });

    this.rangeFancyForm = new FormGroup({
      type: new FormControl(this.currentGame.game_type),
      enterBets: new FormControl("", Validators.required)
    });
    this.getOddsFancy();

    this.manualFancyForm = new FormGroup({
      enterBets: this.formBuilder.array([])
    });
    this.getManualFancy();
  }

  initLink() {
    return this.formBuilder.group({
      id: [],
      name: ["", Validators.required],
      backPrice: ["", Validators.required],
      backAmount: ["", Validators.required],
      layPrice: ["", Validators.required],
      layAmount: ["", Validators.required]
    });
  }

  // addLink() {   const control =
  // <FormArray>this.manualFancyForm.controls['numberOfBets'];
  // control.push(this.initLink()) } Get Max Bets
  public getMaxbets() {
    this.loading = true;
    this.adminService.getMaxbets(this.currentGame.game_id).subscribe(data => {
      if (data.status == 1) {
        this.scoreFancyForm.setValue({
          type: this.currentGame.game_type,
          enterBets: data.max_bets
        });
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

  onSubmitscoreFancyForm(form) {
    this.loading = true;
    this.adminService
      .updMaxbets(this.currentGame.game_id, form.enterBets)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.selectedValue = "";
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

  getOddsFancy() {
    this.loading = true;
    this.adminService.getOddsFancy(this.currentGame.game_id).subscribe(data => {
      if (data.status == 1) {
        this.rangeFancyForm.setValue({
          type: this.currentGame.game_type,
          enterBets: data.data.selections[0].pback
        });
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

  getManualFancy() {
    this.loading = true;
    this.adminService.getOdds(this.currentGame.game_id).subscribe(data => {
      if (data.status == 1) {
        for (let itom in data.data.selections) {
          // this.addLink(); this   .manualFancyForm   .controls['enterBets']
          // .controls[itom]   .setValue({     id: data.data.selections[itom].gselid_bf,
          //   name: data.data.selections[itom].gselname,     backPrice:
          // data.data.selections[itom].pback,     backAmount:
          // data.data.selections[itom].pback_amt,     layPrice:
          // data.data.selections[itom].play,     layAmount:
          // data.data.selections[itom].play_amt   });
        }
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

  onSubmitrangeFancyForm(form) {
    this.loading = true;
    this.adminService
      .updFancyOdds(this.currentGame.game_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.selectedValue = "";
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

  onSubmitScoreNumberForm(form) {
    this.loading = true;
    this.adminService
      .updFancyOdds(this.currentGame.game_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.selectedValue = "";
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

  onSubmitOddEvenForm(form) {
    this.loading = true;
    this.adminService
      .updFancyOdds(this.currentGame.game_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.selectedValue = "";
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

  onSubmitManualFancyForm(form) {
    let tempNumberOfBets = {};
    for (let itom in form.enterBets) {
      form.enterBets[itom].id = Number(itom) + 1;
      tempNumberOfBets[itom] = form.enterBets[itom];
    }
    form.enterBets = JSON.stringify(tempNumberOfBets);

    this.loading = true;
    this.adminService
      .updFancyOdds(this.currentGame.game_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.selectedValue = "";
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

  changeSelectedVal(form) {
    this.loading = true;
    this.adminService
      .getFancySettings(this.currentGame.game_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.settingFancyForm.setValue({
            opt: form.opt,
            val: data.data.value,
            type: form.type
          });
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

  onSubmitsettingFancyForm(form) {
    this.loading = true;
    this.adminService
      .saveFancySettings(this.currentGame.game_id, form)
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.selectedValue = "";
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

  fancyStatus(status) {
    this.loading = true;
    this.adminService
      .updFancyStatus(
        this.currentGame.event_id,
        this.currentGame.match_id,
        status
      )
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.selectedValue = "";
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

  updRangeFancyStatus(status) {
    if (status == 3) {
      status = 1;
    } else {
      status = 3;
    }
    this.loading = true;
    this.adminService
      .updRangeFancyStatus(
        this.currentGame.event_id,
        this.currentGame.match_id,
        status
      )
      .subscribe(data => {
        if (data.status == 1) {
          this.snackBar.open("Successfully", undefined, {
            duration: 3000,
            extraClasses: ["alert-success"]
          });
          this.currentFancyStatus = data.fancy_status;
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
