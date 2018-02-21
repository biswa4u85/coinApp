import { Component, OnInit } from "@angular/core"
import { LoginService, LibraryService } from "../_services/index"
import { Router } from "@angular/router"

@Component({
    selector: "app-footer",
    templateUrl: "./footer.component.html"
})
export class FooterComponent implements OnInit {
    constructor(
    ) { }

    public ngOnInit() {
    }
}