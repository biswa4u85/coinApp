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

import { KeysPipe, inPlayFilterPipe, ReversePipe, utcFilterPipe } from "./_pipe/index";
import { AuthGuard } from "./_guards/index"

import { LoginService, GoogleDriveProvider, LibraryService } from "./_services/index";
import { AppComponent } from "./app.component";

import { LoginComponent, RegisterComponent, PasswordComponent } from "./login/index"
import { HeaderComponent, FooterComponent, HomeComponent, PortfolioComponent } from "./home/index";


const appRoutes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "password", component: PasswordComponent },
  { path: "dashboard", component: HomeComponent },
  { path: "portfolio", component: PortfolioComponent, canActivate: [AuthGuard] },
  { path: "", component: HomeComponent },
  { path: "**", redirectTo: "" }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    PasswordComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    PortfolioComponent,
    KeysPipe,
    inPlayFilterPipe,
    ReversePipe,
    utcFilterPipe
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
    LoginService,
    GoogleDriveProvider,
    LibraryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
