import { Injectable } from "@angular/core";
import * as moment from "moment";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";

@Injectable()
export class LibraryService {
  public lineGamesIds: object = {};
  public closeGamesIds: object = {};
  public voiceActive: number;
  public tvActive: number;
  public setCommentryVal: object = {}
  public lotusStatusCheck: object = {}
  public setScoreVal: object = {};
  public oldValue: string = "";
  constructor(
    private sessionStore: SessionStorageService // private datePipe: DatePipe,
  ) { }

  gameTimerCountDown(time, gameId): void {
    let dateEntered = new Date(time);
    let now = new Date();
    let difference = dateEntered.getTime() - now.getTime();
    let differenceNew = now.getTime() - dateEntered.getTime();
    let preferenceVal: any = JSON.parse(localStorage.getItem("preferenceVal"));

    if (difference >= 0) {
      let seconds = Math.floor(difference / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);
      let days = Math.floor(hours / 24);
      hours %= 24;
      minutes %= 60;
      seconds %= 60;
      if (preferenceVal.deviceInfo == "destopView") {
        this.innerHTMLUpdate(
          "startTimer_" + gameId,
          "Time Remaining " + days + ":" + hours + ":" + minutes + ":" + seconds
        );
      } else {
        this.innerHTMLUpdate(
          "startTimer_" + gameId,
          "T R " + days + ":" + hours + ":" + minutes + ":" + seconds
        );
      }
    } else {
      let seconds = Math.floor(differenceNew / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);
      let days = Math.floor(hours / 24);
      hours %= 24;
      minutes %= 60;
      seconds %= 60;
      if (preferenceVal.deviceInfo == "destopView") {
        this.innerHTMLUpdate(
          "startTimer_" + gameId,
          "Time  Elapsed " + days + ":" + hours + ":" + minutes + ":" + seconds
        );
      } else {
        this.innerHTMLUpdate(
          "startTimer_" + gameId,
          "T E " + days + ":" + hours + ":" + minutes + ":" + seconds
        );
      }
    }
  }

  ShowGameStartTimer(date) {
    let startDate = new Date(date);
    let currentDate = new Date();

    let differenceMilliseconds = startDate.getTime() - currentDate.getTime();
    let differenceMillisecondsAbs = Math.abs(
      startDate.getTime() - currentDate.getTime()
    );

    let hourseLeftInDecimals = differenceMilliseconds / (1000 * 60 * 60);
    let hourseLeft = Math.floor(hourseLeftInDecimals);

    let minutesLeft = Math.floor((hourseLeftInDecimals - hourseLeft) * 60);

    let hourLeftString = hourseLeft < 10 ? `0${hourseLeft}` : `${hourseLeft}`;
    let minuteLeftString =
      minutesLeft < 10 ? `0${minutesLeft}` : `${minutesLeft}`;

    let finalCountdown = `${hourLeftString}:${minuteLeftString}`;

    return finalCountdown;
  }

  //Create Game Id Wise Games
  CreateGameIdWiseGames(gamesArray: any) {
    let gameIdWiseArray = {};
    let gamesBetOptions = [];

    // Create an array of games with game id as index, add bet options array to the
    // game and if the game is of type bet options then check if game exist in
    // array of games if exist then push is in bet options of that game else to
    // games_bet_options

    for (let game of gamesArray) {
      if (game == undefined) {
      }

      let gameIdString = "gameid_" + game["game_id"].toString();
      gameIdWiseArray[gameIdString] = game;
    }

    return gameIdWiseArray;
  }

  // Create Category Wise Games
  CreateCategoryWiseGames(gameIdWiseGamesArray: any) {
    let categoryWiseGamesArray = {};
    let returnGamesArray = [];

    // Create a game array order by category of that game
    for (let gameId in gameIdWiseGamesArray) {
      if (!(gameId == "Other")) {
        let tempCategory = gameIdWiseGamesArray[gameId]["game_type_name"];
        if (!(tempCategory in categoryWiseGamesArray)) {
          categoryWiseGamesArray[tempCategory] = [];
        }
        categoryWiseGamesArray[tempCategory].push(gameIdWiseGamesArray[gameId]);
      } else {
        categoryWiseGamesArray["Other"] = gameIdWiseGamesArray["Other"];
      }
    }

    for (let gameCategory in categoryWiseGamesArray) {
      let gameObject = {
        cat_name: gameCategory,
        data: categoryWiseGamesArray[gameCategory]
      };
      returnGamesArray.push(gameObject);
    }

    return returnGamesArray;
  }

  //Inner HTML Update
  innerHTMLUpdate(id, value) {
    let elem = document.getElementById(id);
    if (elem) {
      elem.innerHTML = value;
    }
  }

  //Odds Diff Calculate
  oddsDiffCalculate(currentOdds): number {
    let diff: number;
    if (currentOdds < 2) {
      diff = 0.01;
    } else if (currentOdds < 3) {
      diff = 0.02;
    } else if (currentOdds < 4) {
      diff = 0.05;
    } else if (currentOdds < 6) {
      diff = 0.1;
    } else if (currentOdds < 10) {
      diff = 0.2;
    } else if (currentOdds < 20) {
      diff = 0.5;
    } else if (currentOdds < 30) {
      diff = 1.0;
    } else {
      diff = 2.0;
    }

    return diff;
  }
  //Date formating letaities date format without milli second
  formatDate_withoutmilli(date) {
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    let milisec = date.getMilliseconds();

    return year + "-" + month + "-" + day + " " + hour + ":" + min;
  }

  formatDate(getDate) {
    let date = moment.utc(getDate, "YYYY-MM-DD HH:mm:ss").toDate();
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    hour = this.checkTime(hour);
    min = this.checkTime(min);
    sec = this.checkTime(sec);
    let milisec = date.getMilliseconds();
    // return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec +
    // ':' + milisec;
    return day + "th " + monthNames[month] + " " + hour + ":" + min + ":" + sec;
  }

  formatTime(getDate) {
    let date = moment.utc(getDate, "YYYY-MM-DD HH:mm:ss").toDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
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

  //stake Diff Calculate
  stakeDiffCalculate(currentStake): number {
    let diff: number;
    if (currentStake < 100) {
      diff = 10;
    } else if (currentStake < 200) {
      diff = 20;
    } else if (currentStake < 500) {
      diff = 50;
    } else if (currentStake < 1000) {
      diff = 100;
    } else if (currentStake < 2000) {
      diff = 250;
    } else if (currentStake < 5000) {
      diff = 500;
    } else if (currentStake < 10000) {
      diff = 1000;
    } else {
      diff = 1500;
    }
    return diff;
  }

  //Socket Data
  showSocketData(data: any) {
    //Check Line Game
    if (data.response.event_type_id == "-8") {
      if (data.response.gid in this.lineGamesIds == false) {
        this.lineGamesIds[data.response.gid] = true;
        // set Status Check
        this.lotusStatusCheck[data.response.mid] = 'OPEN'
      }

    }

    //Check Close Game
    if (data.response.status == "CLOSED") {
      if (data.response.gid in this.closeGamesIds == false) {
        this.closeGamesIds[data.response.gid] = {
          bopt_main: data.response.bopt_main
        };
        this.innerHTMLUpdate("odds_status_" + data.response.gid, "");
      }
    }

    //SET SUSPENDED
    if (data.response.status == "dummyclientkeys") {
      data.response.status = "SUSPENDED";
    }

    let obj = {};

    //Timer Set
    let utcDate = this.formatTime(data.d)
    this.innerHTMLUpdate("odds_timer_" + data.response.gid, utcDate)

    if (data.response.status == "OPEN") {
      //Clear Status
      this.innerHTMLUpdate("odds_status_" + data.response.gid, "");

      for (let i = 0; i < data.response.selections.length; i++) {
        let pl = JSON.parse(JSON.stringify(data.response.selections[i]));

        pl["backPrices"].reverse();

        for (let x = 0; x < pl["backPrices"].length; x++) {
          let backPrices = pl["backPrices"][x];
          let layPrices = pl["layPrices"][x];

          let backId = "backPrices_" + data.response.gid + "_" + pl["gselid_bf"] + "_" + x + "_price";
          let backIdAmmount = "backPrices_" + data.response.gid + "_" + pl["gselid_bf"] + "_" + x + "_amount";

          let layId = "layPrices_" + data.response.gid + "_" + pl["gselid_bf"] + "_" + x + "_price";
          let layIdAmmount = "layPrices_" + data.response.gid + "_" + pl["gselid_bf"] + "_" + x + "_amount";

          if (backPrices["price"] != "" && data.response.event_type_id == -8) {
            this.innerHTMLUpdate(backId, backPrices["price"] + 0.5);
          } else {
            this.innerHTMLUpdate(backId, backPrices["price"]);
          }

          if (backPrices["amount"] == "" || backPrices["amount"] == "0") {
            this.innerHTMLUpdate(backIdAmmount, "");
          } else {
            this.innerHTMLUpdate(
              backIdAmmount,
              backPrices["amount"].toFixed(0)
            );
          }
          if (layPrices["price"] != "" && data.response.event_type_id == -8) {
            this.innerHTMLUpdate(layId, layPrices["price"] + 0.5);
          } else {
            this.innerHTMLUpdate(layId, layPrices["price"]);
          }

          if (layPrices["amount"] == "" || layPrices["amount"] == "0") {
            this.innerHTMLUpdate(layIdAmmount, "");
          } else {
            this.innerHTMLUpdate(layIdAmmount, layPrices["amount"].toFixed(0));
          }
        }
      }
    } else {
      //Set Status
      let status = '<div class="suspended"><div class="titleInner">' + data.response.status + "</div></div>";
      this.innerHTMLUpdate("odds_status_" + data.response.gid, status);
    }
  }

  //Socket Data Lotus
  showSocketDataLotus(data: any) {

    // Display Messgae
    let status
    if (data.message) {
      status = '<div class="suspended"><div class="titleInner">' + data.message + "</div></div>";
    } else {
      status = ''
    }
    this.innerHTMLUpdate("odds_status_" + data.marketId, status)

    // set Status Check
    if (data.status) {
      this.lotusStatusCheck[data.marketId] = data.status
    }

    let pl = data.odds
    // for (let x = 0; x < pl.length; x++) {
    let backPrices = pl[0].back
    let layPrices = pl[0].lay



    let backId = "backPrices_" + data.groupById + "_" + data.marketId + '_' + '0' + "_price";
    let backIdAmmount = "backPrices_" + data.groupById + "_" + data.marketId + "_" + '0' + "_amount";

    let layId = "layPrices_" + data.groupById + "_" + data.marketId + '_' + '2' + "_price";
    let layIdAmmount = "layPrices_" + data.groupById + "_" + data.marketId + '_' + '2' + "_amount";

    // for (let y = 0; y < backPrices.length; y++) {

    if (backPrices[0].price) {
      this.innerHTMLUpdate(backIdAmmount, backPrices[0].price);
    } else {
      this.innerHTMLUpdate(backIdAmmount, '-');
    }
    if (backPrices[0].line) {
      this.innerHTMLUpdate(backId, backPrices[0].line);
    } else {
      this.innerHTMLUpdate(backId, '-');
    }

    if (layPrices[0].price) {
      this.innerHTMLUpdate(layIdAmmount, layPrices[0].price);
    } else {
      this.innerHTMLUpdate(layIdAmmount, '-');
    }
    if (layPrices[0].line) {
      this.innerHTMLUpdate(layId, layPrices[0].line);
    } else {
      this.innerHTMLUpdate(layId, '-');
    }

    // }
    // }


  }

  // get Lotus Sttus
  getlotusStatus(mid) {
    return this.lotusStatusCheck[mid]
  }

  //Get Line Game Status
  getLineGamesId(id) {
    if (id in this.lineGamesIds) {
      return true;
    }
  }

  //Tree Value Json To Array
  jsonParse(data: any) {
    for (let itom of data) {
      if (itom.undertree) {
        itom.name = itom.username;
        if (itom.type == 1) {
          itom.className = "user";
        } else {
          itom.className = "agent";
        }
        itom.children = JSON.parse(itom.undertree);
        this.jsonParse(itom.children);
      }
    }
    return data;
  }

  getVoices() {
    window.speechSynthesis.getVoices();
    return window.speechSynthesis.getVoices();
  }

  search(nameKey, myArray) {
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].name === nameKey) {
        return i;
      }
    }
  }

  sayIt(text, config) {
    let voices = this.getVoices();
    let msg;
    if (window.speechSynthesis) {
      msg = new SpeechSynthesisUtterance();
    }

    // window.speechSynthesis.getVoices(); choose voice. Fallback to default
    // msg.voice = config && config.voice ? config.voice : 'en-EN';
    let resultObject = this.search("Google हिन्दी", voices);
    if (resultObject == undefined) {
    } else {
      msg.voice = voices[resultObject];
      msg.lang = "hi-IN";
    }
    msg.volume = config && config.volume ? config.volume : 1;
    msg.rate = config && config.rate ? config.rate : 1;
    msg.pitch = config && config.pitch ? config.pitch : 1;

    //message for speech
    msg.text = text;

    speechSynthesis.speak(msg);
  }

  fancyBooksGenarate(bookJson) {
    let displayArray = [];
    let bookObject = JSON.parse(bookJson);
    let runStart: number = 0;
    let runEnd: number = 0;
    for (let run in bookObject) {
      let runEnd = Number(run);
      // displayArray.push(`${runStart.toString()} - ${runEnd.toString()} :
      // ${bookObject[run]}`)
      displayArray.push({
        run: `${runStart.toString()} - ${runEnd.toString()}`,
        postion: `${Number(bookObject[run]).toFixed(2)}`
      });
      runStart = runEnd + 1;

      if (runStart > 1000) {
        break;
      }
    }
    return displayArray;
  }

  consolidateBets(data) {
    let totalConsoliId = {};
    for (let item in data) {
      if (data[item].consolidate_id in totalConsoliId) {
        totalConsoliId[data[item].consolidate_id].push([
          data[item].stake,
          data[item].odds
        ]);
      } else {
        totalConsoliId[data[item].consolidate_id] = [];
        totalConsoliId[data[item].consolidate_id].push([
          data[item].stake,
          data[item].odds
        ]);
      }
    }

    var totStake = function (arrayVal) {
      let totalstake = 0;
      for (let item of arrayVal) {
        totalstake += parseFloat(item[0]);
      }
      return totalstake;
    };

    var avgOdds = function (arrayVal) {
      let totalodds = 0;
      for (let item of arrayVal) {
        totalodds += parseFloat(item[1]) * parseFloat(item[0]);
      }
      return totalodds;
    };

    let totalConsolidata = [];
    let tempIdCheck = {};
    let newMyBets = [];
    let y = 0;
    for (let item in data) {
      if (data[item].consolidate_id in totalConsoliId) {
        if (!(data[item].consolidate_id in tempIdCheck)) {
          totalConsolidata.push(JSON.parse(JSON.stringify(data[item])));
          totalConsolidata[y]["stake"] = totStake(
            totalConsoliId[data[item].consolidate_id]
          ).toFixed(2);
          if (data[item].type === "No" || data[item].type === "Yes") {
            totalConsolidata[y]["odds"] = data[item].odds;
          } else {
            totalConsolidata[y]["odds"] = (
              avgOdds(totalConsoliId[data[item].consolidate_id]) /
              totalConsolidata[y]["stake"]
            ).toFixed(2);
          }

          tempIdCheck[data[item].consolidate_id] = true;
          y++;
        }
      }
    }
    // console.log(totalConsolidata)
    return totalConsolidata;
  }

  setVoice(gId) {
    if (gId === this.voiceActive) {
      this.voiceActive = null;
    } else {
      this.voiceActive = gId;
    }
  }
  getVoice() {
    return this.voiceActive;
  }

  setTv(gId) {
    if (gId === this.tvActive) {
      this.tvActive = null;
    } else {
      this.tvActive = gId;
    }
  }
  getTv() {
    return this.tvActive;
  }

  setCommentryTotalVal(data: any) {
    this.setCommentryVal[data.marketId] = data.commentry;
  }

  getCommentryTotalVal(mId) {
    return this.setCommentryVal[mId];
  }

  setScoreTotalVal(data: any) {
    this.setScoreVal[data.groupId] = data.commentry.result;
  }

  getScoreTotalVal(mId) {
    return this.setScoreVal[mId];
  }

  commentaryVoice(newValue) {
    if (this.oldValue !== newValue) {
      this.oldValue = newValue;
      let orgmusicValue = newValue;
      let musicValue;
      var voices = window.speechSynthesis.getVoices();
      var resultObject = this.search("Google हिन्दी", voices);
      var resultObject1 = this.search("Hindi India", voices);
      if (resultObject != undefined || resultObject1 != undefined) {
        if (orgmusicValue == "No Run ") {
          musicValue = "खाली आया, डॉट बॉल";
        } else if (orgmusicValue == "1 Run ") {
          musicValue = "सिंगल आया एक रन";
        } else if (orgmusicValue == "2 Run ") {
          musicValue = "डबल आये दो रन";
        } else if (orgmusicValue == "3 Run ") {
          musicValue = "तीन रन आये तीन रन";
        } else if (orgmusicValue == "Four ") {
          musicValue = "चौका चौका चार रन";
        } else if (orgmusicValue == "Bowler stopped ") {
          musicValue = "बॉलर रुका है, बॉलर ";
        } else if (orgmusicValue == "Six ") {
          musicValue = "छक्का आया, छेह रन";
        } else if (orgmusicValue == "Wicket ") {
          musicValue = "विकेट गया विकेट";
        } else if (orgmusicValue == "No Ball ") {
          musicValue = "नो बॉल आया नो बॉल";
        } else if (orgmusicValue == "Wide ") {
          musicValue = "वाइड बॉल आया वाइड बॉल";
        } else if (orgmusicValue == "Run Out ") {
          musicValue = "रन आउट हो गया, रन आउट";
        } else if (orgmusicValue == "Third Empire ") {
          musicValue = "थर्ड एम्पायर है, थर्ड एम्पायर";
        } else if (orgmusicValue == "Over ") {
          musicValue = "ओवर हो गया ओवर";
        } else if (orgmusicValue == "Drinks Break ") {
          musicValue = "ड्रिंक्स ब्रेक हो गया ड्रिंक्स ब्रेक";
        } else if (orgmusicValue == "Hawa Mein ") {
          musicValue = "हवा में है बॉल, हवा में ";
        } else if (orgmusicValue == "Faster ") {
          musicValue = "फ़ास्ट बॉलर आया, फ़ास्ट बॉलर";
        } else if (orgmusicValue == "Spinner ") {
          musicValue = "बॉलर चेन्ज स्पिनर आया है स्पिनर";
        } else if (orgmusicValue == "Bowler Change ") {
          musicValue = "बॉलर चेन्ज हुआ है नया बॉलर आएगा";
        } else if (orgmusicValue == "Ball Running ") {
          musicValue = "बॉल चालू बॉल";
        } else {
          musicValue = newValue;
        }
      } else {
        if (orgmusicValue == "No Run ") {
          musicValue = "Khali aaya, dot ball";
        } else if (orgmusicValue == "1 Run ") {
          musicValue = "One run";
        } else if (orgmusicValue == "2 Run ") {
          musicValue = "Double run";
        } else if (orgmusicValue == "3 Run ") {
          musicValue = "three runs";
        } else if (orgmusicValue == "Four ") {
          musicValue = "Four runs four";
        } else if (orgmusicValue == "Bowler stopped ") {
          musicValue = "Bowler stopped ";
        } else if (orgmusicValue == "Six ") {
          musicValue = "Six runs six";
        } else if (orgmusicValue == "Wicket ") {
          musicValue = "Wicket";
        } else if (orgmusicValue == "No Ball ") {
          musicValue = "No Ball";
        } else if (orgmusicValue == "Wide ") {
          musicValue = "Wide ball wide";
        } else if (orgmusicValue == "Run Out ") {
          musicValue = "Run out";
        } else if (orgmusicValue == "Third Empire ") {
          musicValue = "third empire";
        } else if (orgmusicValue == "Over ") {
          musicValue = "Over end";
        } else if (orgmusicValue == "Drinks Break ") {
          musicValue = "Drinks break";
        } else if (orgmusicValue == "Hawa Mein ") {
          musicValue = "Hawa mein ";
        } else if (orgmusicValue == "Faster ") {
          musicValue = "Fast bowler";
        } else if (orgmusicValue == "Spinner ") {
          musicValue = "Spinn bowler";
        } else if (orgmusicValue == "Bowler Change ") {
          musicValue = "Bowler change";
        } else if (orgmusicValue == "Ball Running ") {
          musicValue = "ball chalu ball";
        } else {
          musicValue = newValue;
        }
      }
      if (musicValue == undefined) {
        musicValue = "";
      }
      if (window.speechSynthesis) {
        var msg = new SpeechSynthesisUtterance();

        if (resultObject != undefined) {
          msg.voice = voices[resultObject];
          msg.lang = "hi-IN";
        } else if (resultObject1 != undefined) {
          msg.voice = voices[resultObject];
          msg.lang = "hi_IN";
        } else {
        }

        msg.volume = 1;
        msg.rate = 1;
        msg.pitch = 1.2;
        msg.text = musicValue;
        speechSynthesis.speak(msg);
      }
    }
  }

  // Home Token
  public token() {
    // create authorization header with jwt token
    let userDetails = JSON.parse(this.sessionStore.retrieve("userDetails"));
    if (userDetails && userDetails.data.token) {
      let token = userDetails.data.token;
      return token;
    }
  }

  // Admin Token
  public adminToken() {
    // create authorization header with jwt token
    let userDetails = JSON.parse(
      this.sessionStore.retrieve("adminUserDetails")
    );
    if (userDetails && userDetails.data.token) {
      let token = userDetails.data.token;
      return token;
    }
  }

  // Admin User Id
  public adminUId() {
    // create authorization header with jwt token
    let userDetails = JSON.parse(
      this.sessionStore.retrieve("adminUserDetails")
    );
    if (userDetails && userDetails.data.user_id) {
      let userId = userDetails.data.user_id;
      return userId;
    }
  }

  // Board Token
  public boardToken() {
    // create authorization header with jwt token
    let userDetails = JSON.parse(
      this.sessionStore.retrieve("adminUserDetails")
    );
    if (userDetails && userDetails.data.token) {
      let token = userDetails.data.token;
      return token;
    }
  }
}
