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

    function formatDepMessage(index: number, { routeName, estimatedDepartureTime }: { routeName: string, estimatedDepartureTime: string }): string {
        return `${index} | ${routeName}` + ' '.repeat(12 - routeName.length - estimatedDepartureTime.length) + `${estimatedDepartureTime}`;
    }

    /*
            12 - length of route - length of dep time
            +----------------+
            |2 | U2    5 mins|
            |3 | RA4 123 mins|
            +----------------+
     */

    async function displayStuff() {
        if (deps.length === 0) {
            await display2.writeMessage(0, Display.ROW.TOP, 'No bus data :(');
            await display.writeMessage(0, Display.ROW.BOTTOM, ' '.repeat(16));
        } else {
            depIndex = depIndex < deps.length ? depIndex : deps.length < 5 ? deps.length - 1 : depIndex;
            await display2.writeMessage(0, Display.ROW.TOP, formatDepMessage(depIndex + 1, deps[depIndex]));
            if (deps[depIndex + 1]) {
                await display2.writeMessage(0, Display.ROW.BOTTOM, formatDepMessage(depIndex + 2, deps[depIndex + 1]));
            } else {
                await display2.writeMessage(0, Display.ROW.BOTTOM, ' '.repeat(16));
            }
        }
    }

    while (true) {
        const busStopPromise: Promise<any> = busStop.waitForNewDepartures();
        const buttonPromise: Promise<any> = button.waitForPress();
        const i = await waitForFirst([busStopPromise, buttonPromise]);
        if (i === 0) {
            deps = busStop.busDepartures;
            await displayStuff();
        } else {
            const max = deps.length < 5 ? deps.length - 1 : 5;
            depIndex = (depIndex + 1) % max;
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
            } else {
                flag = true;
            }
        });
    goodBye(display2)
        .then(() => {
            if (flag) {
                process.exit();
            } else {
                flag = true;
            }
        });
}

async function goodBye(display: Display) {
    await display.writeMessage(0, Display.ROW.TOP, 'Powering down...');
    await display.writeMessage(0, Display.ROW.BOTTOM, 'Goodbye :)');
    display.closeLcd();
}