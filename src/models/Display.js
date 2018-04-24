"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lcd = require("lcd");
const events_1 = require("events");
class Display {
    constructor(opts) {
        this.displayOptions = opts;
        this.lcdReady = false;
        this.events = new events_1.EventEmitter();
        this.lcd = new Lcd(opts);
        this.lcd.on('ready', this.lcdOnReady.bind(this));
    }
    lcdOnReady() {
        this.lcdReady = true;
        this.events.emit('lcd-ready');
    }
    ensureReady() {
        return new Promise(resolve => {
            if (this.lcdReady) {
                resolve();
            }
            else {
                const listener = () => {
                    resolve();
                    this.events.removeListener(Display.EVENTS.LCD_READY, listener);
                };
                this.events.addListener(Display.EVENTS.LCD_READY, listener);
            }
        });
    }
    started() {
        return this.ensureReady();
    }
    closeLcd() {
        this.lcd.close();
    }
    writeMessage(col, row, message) {
        return new Promise((resolve, reject) => {
            if (col < 0 || col >= this.displayOptions.cols) {
                reject(new Error('Col out of range'));
            }
            else if (row < 0 || row >= this.displayOptions.rows) {
                reject(new Error('Row out of range'));
            }
            else if (this.displayOptions.cols - col < message.length) {
                reject(new Error('Message does not fit on row'));
            }
            else {
                this.ensureReady().then(() => {
                    this.lcd.setCursor(0, row);
                    this.lcd.print('                ', (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            this.lcd.setCursor(col, row);
                            this.lcd.print(message, (err) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve();
                                }
                            });
                        }
                    });
                });
            }
        });
    }
}
Display.ROW = {
    TOP: 0,
    BOTTOM: 1
};
Display.EVENTS = {
    LCD_READY: 'lcd-ready'
};
exports.Display = Display;
//# sourceMappingURL=Display.js.map