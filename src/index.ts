import { Button } from "./models/Button";
import { Display } from "./models/Display";
import { Weather } from "./models/Weather";

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

const weather: Weather = new Weather();

async function start() {
    await display.writeMessage(0, Display.ROW.TOP, 'Temperature:');
    while (true) {
        await weather.waitForWeatherUpdate();
        await display.writeMessage(0, Display.ROW.BOTTOM, `${weather.temperature}°`);
    }
}

start();

process.on('SIGINT', function() {
    console.log("\nending!");
    button.closeButton();
    display.closeLcd();
    process.exit();
});
