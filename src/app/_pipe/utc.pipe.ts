import { Pipe, PipeTransform, Injectable } from "@angular/core"
import * as moment from "moment"

@Pipe({
    name: "utcfilter"
})
@Injectable()
export class utcFilterPipe implements PipeTransform {
    transform(date: Date): any {
        let newDate = moment.utc(date, "YYYY-MM-DD HH:mm:ss").toDate()
        let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
        let year = newDate.getFullYear()
        let month = newDate.getMonth()
        let day = newDate.getDate()
        let hour = newDate.getHours()
        let min = newDate.getMinutes()
        let sec = newDate.getSeconds()
        return day + "th " + monthNames[month] + " " + year + " " + hour + ":" + min + ":" + sec
    }
}