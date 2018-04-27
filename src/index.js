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
        yield display2.writeMessage(0, Display_1.Display.ROW.TOP, 'Buses:');
        let deps = [];
        let depIndex = 0;
        function formatDepMessage(index, { routeName, estimatedDepartureTime }) {
            return `${index} | ${routeName}` + ' '.repeat(12 - routeName.length - estimatedDepartureTime.length) + `${estimatedDepartureTime}`;
        }
        /*
                12 - length of route - length of dep time
                +----------------+
                |2 | U2    5 mins|
                |3 | RA4 123 mins|
                +----------------+
         */
        function displayStuff() {
            return __awaiter(this, void 0, void 0, function* () {
                if (deps.length === 0) {
                    yield display2.writeMessage(0, Display_1.Display.ROW.TOP, 'No bus data :(');
                    yield display.writeMessage(0, Display_1.Display.ROW.BOTTOM, ' '.repeat(16));
                }
                else {
                    depIndex = depIndex < deps.length ? depIndex : deps.length < 5 ? deps.length - 1 : depIndex;
                    yield display2.writeMessage(0, Display_1.Display.ROW.TOP, formatDepMessage(depIndex + 1, deps[depIndex]));
                    if (deps[depIndex + 1]) {
                        yield display2.writeMessage(0, Display_1.Display.ROW.BOTTOM, formatDepMessage(depIndex + 2, deps[depIndex + 1]));
                    }
                    else {
                        yield display2.writeMessage(0, Display_1.Display.ROW.BOTTOM, ' '.repeat(16));
                    }
                }
            });
        }
        while (true) {
            const busStopPromise = busStop.waitForNewDepartures();
            const buttonPromise = button.waitForPress();
            const i = yield waitForFirst([busStopPromise, buttonPromise]);
            if (i === 0) {
                deps = busStop.busDepartures;
                yield displayStuff();
            }
            else {
                const max = deps.length < 5 ? deps.length - 1 : 5;
                depIndex = (depIndex + 1) % max;
                yield displayStuff();
            }
        }
    });
}
function padToLength(str, length) {
    if (str.length > length)
        return str.substr(0, length);
    return str += ' '.repeat(length - str.length);
}
function waitForFirst(ps) {
    return new Promise(resolve => {
        let resolved = false;
        ps.forEach((p, i) => {
            p.then(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(i);
                }
            });
        });
    });
}
start();
start2().catch(e => console.log('fuck', e.message));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
function stop() {
    console.log("\nending!");
    button.closeButton();
    display.closeLcd();
    let flag = false;
    goodBye(display)
        .then(() => {
        if (flag) {
            process.exit();
        }
        else {
            flag = true;
        }
    });
    goodBye(display2)
        .then(() => {
        if (flag) {
            process.exit();
        }
        else {
            flag = true;
        }
    });
}
function goodBye(display) {
    return __awaiter(this, void 0, void 0, function* () {
        yield display.writeMessage(0, Display_1.Display.ROW.TOP, 'Powering down...');
        yield display.writeMessage(0, Display_1.Display.ROW.BOTTOM, 'Goodbye :)');
        display.closeLcd();
    });
}
//# sourceMappingURL=index.js.map