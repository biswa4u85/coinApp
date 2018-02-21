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

@Component({
  selector: "admin-fancy",
  templateUrl: "./fancy.html"
})
export class FancyComponent implements OnInit {
  @Input() currentGameId;
  public loading: boolean;
  public selectedValue: string;
  public scoreFancyForm: object;
  public rangeFancyForm: object;
  public scoreNumberForm: object;
  public oddEvenForm: object;
  public manualFancyForm: any;

  constructor(
    private adminService: AdminService,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar
  ) {
    this.loading = false;
  }

  ngOnInit() {
    this.scoreFancyForm = new FormGroup({
      marketName: new FormControl("", Validators.required),
      numberOfBets: new FormControl("", Validators.required),
      marketType: new FormControl("-2")
    });

    this.rangeFancyForm = new FormGroup({
      marketName: new FormControl("", Validators.required),
      numberOfBets: new FormControl("", Validators.required),
      marketType: new FormControl("-4")
    });

    this.scoreNumberForm = new FormGroup({
      marketName: new FormControl("", Validators.required),
      numberOfBets: new FormControl("", Validators.required),
      marketType: new FormControl("-7")
    });

    this.oddEvenForm = new FormGroup({
      marketName: new FormControl("", Validators.required),
      numberOfBets: new FormControl("", Validators.required),
      marketType: new FormControl("-5")
    });

    this.manualFancyForm = new FormGroup({
      marketName: new FormControl("", Validators.required),
      numberOfBets: this.formBuilder.array([this.initLink()]),
      marketType: new FormControl("-8")
    });
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

  addLink() {
    const control = <FormArray>this.manualFancyForm.controls["numberOfBets"];
    control.push(this.initLink());
  }
  removeLink(i: number) {
    const control = <FormArray>this.manualFancyForm.controls["numberOfBets"];
    control.removeAt(i);
  }

  //Score Fancy Form
  onSubmitscoreFancyForm(form) {
    this.loading = true;
    this.adminService.createGame(this.currentGameId, form).subscribe(data => {
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

  //Range Fancy Form
  onSubmitrangeFancyForm(form) {
    this.loading = true;
    this.adminService.createGame(this.currentGameId, form).subscribe(data => {
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

  //Score Number Fancy Form
  onSubmitScoreNumberForm(form) {
    this.loading = true;
    this.adminService.createGame(this.currentGameId, form).subscribe(data => {
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

  //Odd Even Fancy Form
  onSubmitOddEvenForm(form) {
    this.loading = true;
    this.adminService.createGame(this.currentGameId, form).subscribe(data => {
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

  //Odd Even Fancy Form
  onSubmitManualFancyForm(form) {
    let tempNumberOfBets = {};
    for (let itom in form.numberOfBets) {
      form.numberOfBets[itom].id = Number(itom) + 1;
      tempNumberOfBets[itom] = form.numberOfBets[itom];
    }
    form.numberOfBets = JSON.stringify(tempNumberOfBets);

    this.loading = true;
    this.adminService.createGame(this.currentGameId, form).subscribe(data => {
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
}
