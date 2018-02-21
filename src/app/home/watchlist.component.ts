import { Component, OnInit } from "@angular/core"
import { LoginService, LibraryService } from "../_services/index"
import { Router } from "@angular/router"

@Component({
    selector: "app-watchlist",
    templateUrl: "./watchlist.component.html"
})
export class WatchlistComponent implements OnInit {
    constructor(
    ) { }

    public ngOnInit() {
    }
}