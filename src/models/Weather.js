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
class Weather {
    constructor() {
        this.events = new events_1.EventEmitter();
        this.startUpdateInterval();
    }
    startUpdateInterval() {
        this.updateWeatherData();
        this.updateInterval = setInterval(this.updateWeatherData.bind(this), Weather.UPDATE_INTERVAL_SECONDS * 1000);
    }
    updateWeatherData() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield rp({
                method: 'GET',
                json: true,
                uri: 'http://api.openweathermap.org/data/2.5/weather?q=Bath,uk&appid=370dd1200a67d1b435b8f17cbe2f6161&units=metric'
            });
            if (data.main.temp) {
                this.temperature = data.main.temp;
                this.events.emit('weather-updated');
            }
        });
    }
    waitForWeatherUpdate() {
        return new Promise(resolve => {
            this.events.once('weather-updated', () => {
                resolve();
            });
        });
    }
}
Weather.UPDATE_INTERVAL_SECONDS = 10;
exports.Weather = Weather;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const weather = new Weather();
        while (true) {
            yield weather.waitForWeatherUpdate();
            console.log(weather.temperature);
        }
    });
}
start();
//# sourceMappingURL=Weather.js.map