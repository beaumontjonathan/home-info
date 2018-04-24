import { Button } from "./models/Button";
import { Display } from "./models/Display";

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

display.writeMessage(0, Display.ROW.TOP, 'hello world').then(() => {
    display.writeMessage(0, Display.ROW.BOTTOM, new Date().toISOString().substring(11, 19))
});

process.on('SIGINT', function() {
    console.log("\nending!");
    button.closeButton();
    display.closeLcd();
    process.exit();
});
