import { Button } from "./models/Button";
import { Display } from "./models/Display";
import { Weather } from "./models/Weather";
import { BusStop } from "./models/BusStop";

const button: Button = new Button(26);
button.waitForPress().then(() => {
    console.log('pressed!');
});

const display: Display = new Display({
    rs: 11,
    e: 9,
    data: [10, 22, 27, 17],
    cols: 16,
    rows: 2
});

const display2: Display = new Display({
    rs: 16,
    e: 12,
    data: [25, 24, 23, 18],
    cols: 16,
    rows: 2
});

const weather: Weather = new Weather();

const busStop: BusStop = new BusStop();

async function start() {
    await display.writeMessage(0, Display.ROW.TOP, 'Temperature:');
    while (true) {
        await weather.waitForWeatherUpdate();
        await display.writeMessage(0, Display.ROW.BOTTOM, `${weather.temperature}°`);
    }
}

async function start2() {
    await display2.writeMessage(0, Display.ROW.TOP, 'Buses:');
    let deps = [];
    let depIndex: number = 0;

    async function displayStuff() {
        console.log(deps);
        if (deps.length === 0) {
            let message = 'No bus data :(';
            await display2.writeMessage(0, Display.ROW.BOTTOM, message);
        } else {
            depIndex = deps.length < 5 ? deps.length - 1 : depIndex;
            const m1 = `${depIndex + 1}  ${padToLength(deps[depIndex].routeName, 3)} - ${deps[depIndex].estimatedDepartureTime}`.substr(0, 16);
            await display2.writeMessage(0, Display.ROW.TOP, m1);
            if (deps[depIndex + 1]) {
                const m2 = `${depIndex + 2}  ${padToLength(deps[depIndex + 1].routeName, 3)} - ${deps[depIndex + 1].estimatedDepartureTime}`.substr(0, 16);
                await display2.writeMessage(0, Display.ROW.BOTTOM, m2);
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
    }

    while (true) {
        const busStopPromise: Promise<any> = busStop.waitForNewDepartures();
        const buttonPromise: Promise<any> = button.waitForPress();
        const i = await waitForFirst([busStopPromise, buttonPromise]);
        depIndex = 0;
        console.log('the value of i is ' + i);
        if (i === 0) {
            deps = busStop.busDepartures;
            await displayStuff();
        } else {
            let m = 'Updating depIndex. Was ' + depIndex;
            const max = deps.length < 5 ? deps.length - 1 : 5;
            depIndex = (depIndex + 1) % max;
            m += ', now is ' + depIndex;
            console.log(depIndex);
            await displayStuff();
        }
    }
}

function padToLength(str: string, length: number) {
    if (str.length > length) return str.substr(0, length);
    return str += ' '.repeat(length - str.length);
}

function waitForFirst(ps: Promise<any>[]): Promise<number> {
    return new Promise<number>(resolve => {
        let resolved: boolean = false;
        ps.forEach((p, i) => {
            p.then(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(i);
                }
            });
        })
    });
}

start();
start2().catch(e => console.log('fuck', e.message));

process.on('SIGINT', function() {
    console.log("\nending!");
    button.closeButton();
    display.closeLcd();
    process.exit();
});
