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
const Button_1 = require("./models/Button");
const Display_1 = require("./models/Display");
const Weather_1 = require("./models/Weather");
const BusStop_1 = require("./models/BusStop");
const button = new Button_1.Button(26);
button.waitForPress().then(() => {
    console.log('pressed!');
});
const display = new Display_1.Display({
    rs: 11,
    e: 9,
    data: [10, 22, 27, 17],
    cols: 16,
    rows: 2
});
const display2 = new Display_1.Display({
    rs: 16,
    e: 12,
    data: [25, 24, 23, 18],
    cols: 16,
    rows: 2
});
const weather = new Weather_1.Weather();
const busStop = new BusStop_1.BusStop();
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield display.writeMessage(0, Display_1.Display.ROW.TOP, 'Temperature:');
        while (true) {
            yield weather.waitForWeatherUpdate();
            yield display.writeMessage(0, Display_1.Display.ROW.BOTTOM, `${weather.temperature}°`);
        }
    });
}
function start2() {
    return __awaiter(this, void 0, void 0, function* () {
        yield display.writeMessage(0, Display_1.Display.ROW.TOP, 'Buses:');
        while (true) {
            yield busStop.waitForNewDepartures();
            let deps = busStop.busDepartures;
            let message = '';
            if (deps.length === 0) {
                message += 'No bus data :(';
            }
            else {
                message += `${deps[0].routeName} - ${deps[0].date} ${deps[0].estimatedDepartureTime}`;
            }
            yield display.writeMessage(0, Display_1.Display.ROW.BOTTOM, message);
        }
    });
}
start();
start2();
process.on('SIGINT', function () {
    console.log("\nending!");
    button.closeButton();
    display.closeLcd();
    process.exit();
});
//# sourceMappingURL=index.js.map