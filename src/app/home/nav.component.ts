import { Component, OnInit } from "@angular/core"
import { LoginService } from "../_services/index"
import { Router } from "@angular/router"

@Component({
    selector: "app-nav",
    templateUrl: "./nav.component.html"
})
export class NavComponent implements OnInit {
    constructor(
        public loginService: LoginService,
    ) { }

    public ngOnInit() {

    }

    public pageRefresh() {
        window.location.reload();
    }

}