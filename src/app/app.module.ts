import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ModalModule, CollapseModule, AccordionModule } from "ngx-bootstrap";
import {
  MatDialogModule,
  MatTabsModule,
  MatSelectModule,
  MatSidenavModule,
  MatCardModule,
  MatIconModule,
  MatInputModule,
  MatButtonModule,
  MatRadioModule,
  MatCheckboxModule,
  MatSnackBarModule,
  MatSlideToggleModule,
  MatTooltipModule,
  MatMenuModule
} from "@angular/material";
import { Routes, RouterModule } from "@angular/router";
import { VirtualScrollModule } from "angular2-virtual-scroll";
import { Ng2Webstorage } from "ngx-webstorage";
import { DatePipe } from "@angular/common";
import { MomentModule } from "angular2-moment";
import { NgPipesModule } from "ngx-pipes";
import { TreeModule } from "angular-tree-component";
import { DatePickerModule } from "ng2-datepicker";
import { SelectModule } from "angular2-select";
import { DragScrollModule } from "angular2-drag-scroll";
import { Ng2DeviceDetectorModule } from "ng2-device-detector";
import { Ng2FilterPipeModule } from "ng2-filter-pipe";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { CalendarModule } from "angular-calendar";
// import { CookieService } from 'angular2-cookie/services/cookies.service';

import { KeysPipe, inPlayFilterPipe, ReversePipe, utcFilterPipe } from "./_pipe/index";
import { AuthGuard, AdminGuard } from "./_guards/index";
import { VarDirective } from "./_directives/index";
import { LangPipe } from "./_language/index";

import {
  LoginService,
  HomeService,
  AdminService,
  BoardService,
  LibraryService
} from "./_services/index";
import { AppComponent } from "./app.component";
import { LoginComponent, TermsDialog } from "./login/login.component";
import { HomeComponent } from "./home/home.component";
import { AdminComponent } from "./admin/admin.component";
import {
  GamesComponent,
  LivescoreComponent,
  SocketComponent,
  FancySocketComponent,
  SliderComponent,
  BetComponent,
  BookComponent
} from "./home/_games/index";
import { ReportComponent } from "./home/_reports/report";
import { CustomEventTitleFormatter } from "./home/_reports/custom-event-title-formatter.provider";
import { OptionsComponent } from "./home/_options/options";
import { MybetsComponent } from "./home/_mybets/mybets";
import { SettingComponent } from "./admin/_settings/settings";
import {
  FancyComponent,
  EditFancyComponent
} from "./admin/_games/_fancy/index";
import { UserComponent, UserReportComponent } from "./admin/_users/index";
import {
  AdminReportComponent,
  AdminBalanceComponent
} from "./admin/_reports/index";
import {
  AdminGamesComponent,
  AdminSocketComponent,
  LineAdminSocketComponent,
  AdminBookComponent
} from "./admin/_games/index";
import { KeyboardComponent } from "./home/_keyboard/keyboard";
import { LineComponent } from "./line/line.component";
import { AddFancyComponent } from "./fancy/fancy.component";

import { BoardComponent } from "./board/board.component";
import { BoardAdminComponent } from "./admin/_games/_board/board";

const appRoutes: Routes = [
  { path: "line", component: LoginComponent },
  { path: "lineboard", component: LineComponent, canActivate: [AdminGuard] },
  { path: "fancy", component: LoginComponent },
  { path: "fancyboard", component: AddFancyComponent, canActivate: [AdminGuard] },
  { path: "login", component: LoginComponent },
  { path: "admin", component: LoginComponent },
  { path: "dashboard", component: AdminComponent, canActivate: [AdminGuard] },
  { path: "board", component: LoginComponent },
  { path: "adminboard", component: BoardComponent, canActivate: [AdminGuard] },
  {
    path: "keyboard",
    component: BoardAdminComponent,
    canActivate: [AdminGuard]
  },
  { path: "", component: HomeComponent, canActivate: [AuthGuard] },
  { path: "**", redirectTo: "" }
];

@NgModule({
  declarations: [
    LangPipe,
    AppComponent,
    LoginComponent,
    TermsDialog,
    HomeComponent,
    AdminComponent,
    GamesComponent,
    LivescoreComponent,
    SocketComponent,
    FancySocketComponent,
    BetComponent,
    BookComponent,
    SliderComponent,
    BoardComponent,
    BoardAdminComponent,
    ReportComponent,
    OptionsComponent,
    MybetsComponent,
    SettingComponent,
    FancyComponent,
    EditFancyComponent,
    UserComponent,
    UserReportComponent,
    AdminReportComponent,
    AdminBalanceComponent,
    AdminGamesComponent,
    AdminBookComponent,
    AdminSocketComponent,
    LineAdminSocketComponent,
    KeyboardComponent,
    KeysPipe,
    inPlayFilterPipe,
    ReversePipe,
    utcFilterPipe,
    VarDirective,
    LineComponent,
    AddFancyComponent,
    BoardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    VirtualScrollModule,
    MomentModule,
    TreeModule,
    Ng2SmartTableModule,
    Ng2Webstorage,
    NgPipesModule,
    Ng2FilterPipeModule,
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    CollapseModule.forRoot(),
    AccordionModule.forRoot(),
    Ng2DeviceDetectorModule.forRoot(),
    CalendarModule.forRoot(),
    MatTooltipModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTabsModule,
    MatSlideToggleModule,
    DatePickerModule,
    DragScrollModule,
    SelectModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false })
  ],
  providers: [
    AuthGuard,
    AdminGuard,
    LoginService,
    HomeService,
    AdminService,
    BoardService,
    LibraryService
    // CookieService
  ],
  entryComponents: [TermsDialog],
  bootstrap: [AppComponent]
})
export class AppModule { }
