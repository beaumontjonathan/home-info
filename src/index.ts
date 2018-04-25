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
    await display.writeMessage(0, Display.ROW.TOP, 'Buses:');
    while (true) {
        await busStop.waitForNewDepartures();
        let deps = busStop.busDepartures;
        let message = '';
        if (deps.length === 0) {
            message += 'No bus data :(';
        } else {
            message += `${deps[0].routeName} - ${deps[0].date} ${deps[0].estimatedDepartureTime}`
        }
        await display.writeMessage(0, Display.ROW.BOTTOM, message);
    }
}

start();
start2();

process.on('SIGINT', function() {
    console.log("\nending!");
    button.closeButton();
    display.closeLcd();
    process.exit();
});
