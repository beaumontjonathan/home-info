"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rp = require("request-promise");
const events_1 = require("events");
class BusStop {
    constructor() {
        this.events = new events_1.EventEmitter();
        this.busDepartures = [];
        this.startUpdateInterval();
    }
    startUpdateInterval() {
        this.updateArrivalData();
        this.updateInterval = setInterval(this.updateArrivalData.bind(this), BusStop.UPDATE_INTERVAL_SECONDS * 1000);
    }
    updateArrivalData() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield rp({
                method: 'GET',
                json: true,
                uri: url
            });
            this.processBusStopResponse(data);
        });
    }
    processBusStopResponse(data) {
        if (!data || !data.times)
            return;
        const times = data.times;
        const departures = times
            .filter(dep => dep.IsLive = 'Y')
            .map(dep => {
            return {
                routeName: dep.ServiceNumber,
                estimatedDepartureTime: this.formatDepartureTime(dep.Due)
            };
        });
        this.busDepartures = departures;
        this.events.emit('updated-departures');
    }
    waitForNewDepartures() {
        return new Promise(resolve => {
            this.events.once('updated-departures', () => {
                resolve();
            });
        });
    }
    formatDepartureTime(dep) {
        if (dep.includes(':')) {
            const parts = dep.split(':');
            if (parts.length !== 2)
                return dep;
            const now = new Date();
            const then = new Date();
            then.setHours(parseInt(parts[0]));
            then.setMinutes(parseInt(parts[1]));
            let newDep;
            let minutesDif = (+then - +now) / 60000;
            if (minutesDif < 0) {
                then.setDate(then.getDate() + 1);
                minutesDif = (+then - +now) / 60000;
            }
            newDep = `${Math.round(minutesDif)} mins`;
            return newDep;
        }
        else {
            return dep;
        }
    }
}
BusStop.UPDATE_INTERVAL_SECONDS = 10;
exports.BusStop = BusStop;
const url = 'https://www.firstgroup.com/getNextBus?stop=0180BAC30294';
//const url = 'http://transportapi.com/v3/uk/bus/stop/0180BAC30294/live.json?app_id=a48c7d2d&app_key=16afbe976ee991141e25c97aba419c92'; 
//# sourceMappingURL=BusStop.js.map