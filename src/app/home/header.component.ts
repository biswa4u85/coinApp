import { Component, OnInit } from "@angular/core"
import { LoginService } from "../_services/index"
import { Router } from "@angular/router"

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit {
    constructor(
        public loginService: LoginService,
    ) { }

    public ngOnInit() {
    }
}