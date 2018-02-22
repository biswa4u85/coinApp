import { Injectable } from "@angular/core"
import { Http, Headers, Response } from "@angular/http"

import { Subject } from "rxjs/Subject"
import { Observable } from "rxjs/Observable"
import "rxjs/add/operator/takeWhile"

import { Router } from "@angular/router"
import { LocalStorageService, SessionStorageService } from "ngx-webstorage"
import { LibraryService } from './library.service'
import { Users } from '../_interface'

declare var require: any

@Injectable()
export class LoginService {

  public baseUrl: string
  public appKey: string
  public userTableId: string

  constructor(
    private http: Http,
    private router: Router,
    private sessionStore: SessionStorageService,
    private libraryService: LibraryService
  ) {
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets/'
    this.appKey = 'AIzaSyAhgykhkpH_Q4EIS4CspNT6CUHci_5Oiuw'
    this.userTableId = '1Cawr42EEHk1shXatXTNE86HIblMryc3TUE-Y9sD7wKk/values/Sheet1'
  }

  getUsers(form: any) {
    let options = { params: { key: this.appKey } }
    return this.http.get(this.baseUrl + this.userTableId, options).map(res => this.libraryService.googleFormatData(res.json()))
  }

  addUsers(form: any) {
    let options = { params: { key: this.appKey } }
    return this.http.post(this.baseUrl + this.userTableId + ':append', options).map(res => res.json())
  }

  logout() {
    this.sessionStore.store("userDetails", null)
    this.router.navigate(['/login'])
  }
}
