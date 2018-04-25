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
        this.updateInterval = setInterval(this.updateArrivalData.bind(this), 5000);
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
        const dataU2 = data.departures['U1'] || [];
        const data1 = data.departures['1'] || [];
        const allData = dataU2.concat(data1);
        const departures = allData
            .map(dep => {
            return {
                routeName: dep.line_name,
                date: dep.date,
                estimatedDepartureTime: dep.best_departure_estimate
            };
        })
            .sort(({ date: d1, estimatedDepartureTime: t1 }, { date: d2, estimatedDepartureTime: t2 }) => {
            return +new Date(`${d1} ${t1}`) - +new Date(`${d2} ${t2}`);
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
}
BusStop.UPDATE_INTERVAL_SECONDS = 10;
exports.BusStop = BusStop;
const url = 'http://transportapi.com/v3/uk/bus/stop/0180BAC30294/live.json?app_id=f366ed6e&app_key=8a53da7e0c5fee4164410f3aede9439e';
//# sourceMappingURL=BusStop.js.map