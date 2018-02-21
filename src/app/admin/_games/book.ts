import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  OnInit
} from "@angular/core";
import { AdminService, LibraryService } from "../../_services/index";

@Component({
  selector: "admin-book",
  templateUrl: "./book.html"
})
export class AdminBookComponent implements OnInit {
  @Input() gId: number;
  public loading: boolean;
  public bookDetails: any[];

  constructor(
    private adminService: AdminService,
    private libraryService: LibraryService
  ) {
    this.loading = false;
  }

  public ngOnInit() {
    this.adminService.fancyBook(this.gId).subscribe(data => {
      if (data.status == 1) {
        this.bookDetails = [];
        for (let item of data.data) {
          this.bookDetails.push({
            sellname: item.sel_name,
            pl: this.libraryService.fancyBooksGenarate(item.pl)
          });
        }
      }
    });
  }
}
