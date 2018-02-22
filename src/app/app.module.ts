import { BrowserModule } from "@angular/platform-browser"
import { NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { HttpModule } from "@angular/http"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { ModalModule, CollapseModule, AccordionModule } from "ngx-bootstrap"
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
import { Routes, RouterModule } from "@angular/router"
import { Ng2Webstorage } from "ngx-webstorage"
import { Ng2DeviceDetectorModule } from "ng2-device-detector"

import { KeysPipe, inPlayFilterPipe, ReversePipe, utcFilterPipe } from "./_pipe/index"
import { AuthGuard } from "./_guards/index"
import { LoginService, LibraryService } from "./_services/index"

import { AppComponent } from "./app.component"
import { LoginComponent, RegisterComponent, PasswordComponent } from "./login/index"
import { HeaderComponent, NavComponent, FooterComponent, HomeComponent, PortfolioComponent, WatchlistComponent } from "./home/index"

const appRoutes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "password", component: PasswordComponent },
  { path: "dashboard", component: HomeComponent },
  { path: "portfolio", component: PortfolioComponent, canActivate: [AuthGuard] },
  { path: "watchlist", component: WatchlistComponent, canActivate: [AuthGuard] },
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
    NavComponent,
    FooterComponent,
    HomeComponent,
    PortfolioComponent,
    WatchlistComponent,
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
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    CollapseModule.forRoot(),
    AccordionModule.forRoot(),
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
    Ng2Webstorage,
    Ng2DeviceDetectorModule.forRoot(),
    RouterModule.forRoot(appRoutes, { enableTracing: false })
  ],
  providers: [
    AuthGuard,
    LoginService,
    LibraryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
