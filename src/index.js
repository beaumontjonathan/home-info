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
        function displayStuff() {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(deps);
                if (deps.length === 0) {
                    let message = 'No bus data :(';
                    yield display2.writeMessage(0, Display_1.Display.ROW.BOTTOM, message);
                }
                else {
                    depIndex = deps.length < 5 ? deps.length - 1 : depIndex;
                    const m1 = `${depIndex + 1}  ${padToLength(deps[depIndex].routeName, 3)} - ${deps[depIndex].estimatedDepartureTime}`.substr(0, 16);
                    yield display2.writeMessage(0, Display_1.Display.ROW.TOP, m1);
                    if (deps[depIndex + 1]) {
                        const m2 = `${depIndex + 2}  ${padToLength(deps[depIndex + 1].routeName, 3)} - ${deps[depIndex + 1].estimatedDepartureTime}`.substr(0, 16);
                        yield display2.writeMessage(0, Display_1.Display.ROW.BOTTOM, m2);
                    }
                    /*if (deps.length === 1) {
                        message += `${deps[0].routeName} - ${deps[0].estimatedDepartureTime}`
                        await display2.writeMessage(0, Display.ROW.BOTTOM, message);
                    } else {
                        message = `${deps[0].routeName} - ${deps[0].estimatedDepartureTime}`
                        await display2.writeMessage(0, Display.ROW.TOP, message);
                        message = `${deps[1].routeName} - ${deps[1].estimatedDepartureTime}`
                        await display2.writeMessage(0, Display.ROW.BOTTOM, message);
                    }*/
                }
            });
        }
        while (true) {
            const busStopPromise = busStop.waitForNewDepartures();
            const buttonPromise = button.waitForPress();
            const i = yield waitForFirst([busStopPromise, buttonPromise]);
            depIndex = 0;
            console.log('the value of i is ' + i);
            if (i === 0) {
                deps = busStop.busDepartures;
                yield displayStuff();
            }
            else {
                let m = 'Updating depIndex. Was ' + depIndex;
                const max = deps.length < 5 ? deps.length - 1 : 5;
                depIndex = (depIndex + 1) % max;
                m += ', now is ' + depIndex;
                console.log(depIndex);
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
process.on('SIGINT', function () {
    console.log("\nending!");
    button.closeButton();
    display.closeLcd();
    process.exit();
});
//# sourceMappingURL=index.js.map