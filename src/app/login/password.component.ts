import { Component, OnInit, Inject } from "@angular/core"
import { FormControl, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"

import { LoginService } from "../_services/index"
import { MatSnackBar } from "@angular/material"
import { SessionStorageService } from "ngx-webstorage"
import { Ng2DeviceService } from "ng2-device-detector"

@Component({
    selector: "app-password",
    templateUrl: "./password.component.html"
})
export class PasswordComponent implements OnInit {
    public loginForm: FormGroup
    public loading: boolean = false
    public deviceInfo: string

    constructor(
        private router: Router,
        private deviceService: Ng2DeviceService,
        private sessionStore: SessionStorageService,
        private loginService: LoginService,
        public snackBar: MatSnackBar,
    ) { }

    ngOnInit() {

        // Set Preference Value
        if (!localStorage.getItem("preferenceVal")) {
            localStorage.setItem("preferenceVal", JSON.stringify({ deviceInfo: "destopView" }))
        }

        //Put Device Info
        let deviceDetails = this.deviceService.getDeviceInfo()
        if (deviceDetails.device == "unknown") {
            this.deviceInfo = "destopView"
        } else {
            this.deviceInfo = "mobileView"
        }

        //Update preference val with mobile/desktop view and re-save
        let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"));
        preferenceVal.deviceInfo = this.deviceInfo
        localStorage.setItem("preferenceVal", JSON.stringify(preferenceVal))

        this.loginForm = new FormGroup({
            username: new FormControl("", Validators.required),
            password: new FormControl()
        })
    }

    onSubmit(form: any) {
        // this.loginService.adminLogin(form).subscribe(data => {
        //     console.log(data)
        //     if (data.status == 1) {
        //         console.log(data)
        //     } else {
        //         this.snackBar.open(data.error, undefined, {
        //             duration: 3000,
        //             extraClasses: ["alert-danger"]
        //         })
        //         this.loading = false;
        //     }
        // })
    }
}