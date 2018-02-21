import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  OnInit
} from "@angular/core";
import { HomeService, LibraryService } from "../../_services/index";
// ch340g driver
@Component({ selector: "app-book", templateUrl: "./book.html" })
export class BookComponent implements OnInit {
  @Input() gId: number;
  public loading: boolean;
  public bookDetails: any[];

  constructor(
    private homeService: HomeService,
    private libraryService: LibraryService
  ) {
    this.loading = false;
  }

  public ngOnInit() {
    this.homeService.fancyBook(this.gId).subscribe(data => {
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
