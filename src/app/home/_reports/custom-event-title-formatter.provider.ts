import { LOCALE_ID, Inject } from "@angular/core";
import { CalendarEventTitleFormatter, CalendarEvent } from "angular-calendar";
import { LocalDataSource } from "ng2-smart-table";

export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  constructor(@Inject(LOCALE_ID) private locale: string) {
    super();
  }

  formatTime(date) {
    date = new Date(date);
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    hour = this.checkTime(hour);
    min = this.checkTime(min);
    sec = this.checkTime(sec);
    return hour + ":" + min + ":" + sec;
  }

  checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  month(event: CalendarEvent): string {
    let data = ``;
    let statusSettings = {
      actions: false,
      columns: {
        user_name: {
          title: "User Name"
        },
        balance: {
          type: "html",
          title: "Balance",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${
              row.balance >= 0 ? "positive" : "negative"
            }">${cell}</div>`;
          }
        },
        exposure: {
          type: "html",
          title: "Exposure",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right">${cell}</div>`;
          }
        },
        pl: {
          type: "html",
          title: "PL",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${
              row.pl >= 0 ? "positive" : "negative"
            }">${cell}</div>`;
          }
        },
        dw: {
          type: "html",
          title: "DW",
          valuePrepareFunction: (cell, row) => {
            return `<div class="text-right ${
              row.dw >= 0 ? "positive" : "negative"
            }">${cell}</div>`;
          }
        }
      }
    };
    let statusReport;
    if (event.cssClass == "pl") {
      // Pl Report
      if (event.meta) {
        if (event.meta.length != 0) {
          data =
            data +
            `<ng2-smart-table [settings]="${statusSettings}" [source]="${statusReport}"></ng2-smart-table>
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
          
      <thead>
      <tr>
        <th width="8%">Time</th>        
        <th width="47%">Game Name</th>
        <th width="15%">Profit/Loss</th>
        <th width="15%">Comm</th>
        <th width="15%">Net</th>
      </tr>
    </thead>
    </table>
    
    <div id="style-6" class="calenderTbl scrollbar">
    <table>
    <tbody>`;
          for (let item of event.meta) {
            data =
              data +
              `
        <tr class="games_${item.game_id}">
              <td width="8%">${this.formatTime(item.dt)}</td>
              <td width="47%" class="iconSpace gameIcon${item.game_type}">${
                item.game
              }</td>
              <td width="15%" class="text-right ${
                item.gross >= 0 ? "minus" : "plus"
              }">${
                item.gross >= 0 ? item.gross : (-1 * item.gross).toFixed(2)
              }</td>
              <td width="15%" class="text-right ${
                item.comm >= 0 ? "minus" : "plus"
              }">${
                item.comm >= 0 ? item.comm : (-1 * item.comm).toFixed(2)
              }</td>
              <td width="15%" class="text-right ${
                item.nett >= 0 ? "minus" : "plus"
              }">${
                item.nett >= 0 ? item.nett : (-1 * item.nett).toFixed(2)
              }</td>
            </tr>`;
          }
          data =
            data +
            `</tbody>
        </table></div>`;
        }
      }
    } else if (event.cssClass == "txn") {
      // Txn Report
      if (event.meta) {
        if (event.meta.length != 0) {
          data =
            data +
            `<table border="0" cellpadding="0" cellspacing="0" width="100%">
      <thead>
      <tr>
        <th width="10%">Time</th>
        <th width="10%">Account</th>
        <th width="30%">Type</th>
        <th width="25%">Remark</th>
        <th width="25%">Amount</th>
      </tr>
    </thead>
    </table>
    <div id="style-6" class="calenderTbl scrollbar">
    <table>
    <tbody>`;
          for (let item of event.meta) {
            data =
              data +
              ` 
        <tr class="">
              <td width="10%">${this.formatTime(item.dt)}</td>
              <td width="10%">${item.name}</td>
              ${
                item.type == 2
                  ? '<td width="30%">Credit Balance Added</td>'
                  : ""
              }
              ${
                item.type == 3
                  ? '<td width="30%">Credit Balance Removed</td>'
                  : ""
              }
              ${item.type == 4 ? '<td width="30%">Deposit</td>' : ""}
              ${item.type == 5 ? '<td width="30%">Withdraw</td>' : ""}
              <td width="25%">${item.remark}</td>
              <td width="25%" class="text-right ${
                item.amount >= 0 ? "plus" : "minus"
              }">${
                item.amount >= 0 ? item.amount : (-1 * item.amount).toFixed(2)
              }</td>
            </tr>`;
          }
          data =
            data +
            `</tbody>
        </table></div>`;
        }
      }
    } else if (event.cssClass == "account_statement") {
      // Account Statement
      if (event.meta) {
        if (event.meta.length != 0) {
          data =
            data +
            `<table border="0" cellpadding="0" cellspacing="0" width="100%">
      
      <thead>
      <tr>
        <th width="8%">Time</th>
        <th width="42%">Desc</th>
        <th width="15%">Debit</th>
        <th width="15%">Credit</th>
        <th width="20%">Running Balance</th>
      </tr>
    </thead> 
    </table>   
    <div id="style-6" class="calenderTbl scrollbar">
    <table>
    <tbody>`;
          for (let item of event.meta) {
            data =
              data +
              ` 
        <tr class="">
              <td width="8%">${this.formatTime(item.date)}</td>
              <td width="42%">${item.desc}</td>
              <td width="15%" class="text-right ${
                item.exposure == 1 ? "plusExp" : "minus"
              }">${item.debit.toFixed(2)}</td>
              <td width="15%" class="text-right plus">${item.credit.toFixed(
                2
              )}</td>
              <td width="20%" class="text-right ${
                item.balance >= 0 ? "plus" : "minus"
              }">${
                item.balance >= 0
                  ? item.balance
                  : (-1 * item.balance).toFixed(2)
              }</td>
            </tr>`;
          }
          data =
            data +
            `</tbody>
        </table></div>`;
        }
      }
    }
    return `${data}`;
  }

  week(event: CalendarEvent): string {
    return `${event.title}`;
  }

  day(event: CalendarEvent): string {
    return `${event.title}`;
  }
}
