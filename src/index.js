"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Button_1 = require("./models/Button");
const Display_1 = require("./models/Display");
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
display.writeMessage(0, Display_1.Display.ROW.TOP, 'hello world').then(() => {
    display.writeMessage(0, Display_1.Display.ROW.BOTTOM, new Date().toISOString().substring(11, 19));
});
process.on('SIGINT', function () {
    console.log("\nending!");
    button.closeButton();
    display.closeLcd();
    process.exit();
});
//# sourceMappingURL=index.js.map