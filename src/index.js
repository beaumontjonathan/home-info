"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Button_1 = require("./models/Button");
const button = new Button_1.Button(26);
button.waitForPress().then(() => {
    console.log('pressed!');
});
process.on('SIGINT', function () {
    console.log("\nending!");
    button.closeButton();
    process.exit();
});
//# sourceMappingURL=index.js.map