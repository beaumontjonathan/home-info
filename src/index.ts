import { Button } from "./models/Button";

const button: Button = new Button(26);
button.waitForPress().then(() => {
    console.log('pressed!');
});

process.on('SIGINT', function() {
    console.log("\nending!");
    button.closeButton();
    process.exit();
});
