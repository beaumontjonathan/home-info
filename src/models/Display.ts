import * as Lcd from 'lcd';
import {EventEmitter} from 'events';

export type DisplayOptions = {
    rs: number;
    e: number;
    data: [number, number, number, number];
    cols: number;
    rows: number;
}

export class Display {
    private lcd: any;
    private lcdReady: boolean;
    private events: EventEmitter;
    private displayOptions: DisplayOptions;
    public static readonly ROW = {
        TOP: 0,
        BOTTOM: 1
    };
    private static readonly EVENTS = {
        LCD_READY: 'lcd-ready'
    };

    constructor(opts: DisplayOptions) {
        this.displayOptions = opts;
        this.lcdReady = false;
        this.events = new EventEmitter();
        this.lcd = new Lcd(opts);
        this.lcd.on('ready', this.lcdOnReady.bind(this));
    }

    private lcdOnReady() {
        this.lcdReady = true;
        this.events.emit('lcd-ready');
    }

    private ensureReady(): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.lcdReady) {
                resolve();
            } else {
                const listener = () => {
                    resolve();
                    this.events.removeListener(Display.EVENTS.LCD_READY, listener);
                };
                this.events.addListener(Display.EVENTS.LCD_READY, listener);
            }
        });
    }

    public started(): Promise<void> {
        return this.ensureReady();
    }

    public closeLcd() {
        this.lcd.close();
    }

    public writeMessage(col: number, row: number, message: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (col < 0 || col >= this.displayOptions.cols) {
                reject(new Error('Col out of range'));
            } else if (row < 0 || row >= this.displayOptions.rows) {
                reject(new Error('Row out of range'));
            } else if (this.displayOptions.cols - col < message.length) {
                reject(new Error('Message does not fit on row'));
            } else {
                this.ensureReady().then(() => {
                    this.lcd.setCursor(0, row);
                    this.lcd.print('                ', (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            this.lcd.setCursor(col, row);
                            this.lcd.print(message, (err) => {
                                if (err) {
                                    reject(err);
                                } else {
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
