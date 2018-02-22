import { Component, OnInit, Inject } from "@angular/core"
import { FormControl, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"

import { LoginService, LibraryService } from "../_services/index"
import { MatSnackBar } from "@angular/material"
import { SessionStorageService } from "ngx-webstorage"
import { Ng2DeviceService } from "ng2-device-detector"

@Component({
    selector: "app-password",
    styleUrls: ["./login.component.scss"],
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
        private libraryService: LibraryService,
        public snackBar: MatSnackBar,
    ) { }

    ngOnInit() {

        let userDetails = JSON.parse(this.sessionStore.retrieve("userDetails"))
        if (userDetails) {
            this.router.navigate(['/dashboard'])
        }

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
            email: new FormControl("", Validators.required)
        })
    }

    onSubmit(form: any) {
        this.loading = false
        let option = { email: form.email }
        this.loginService.getUsers(form).subscribe(data => {
            for (let item of data) {
                if (item.email == option.email) {
                    let password = this.libraryService.dncVal(item.password)
                    console.log(password)
                    this.router.navigate(['/login'])
                }
            }
            this.loading = true
        })

    }
}