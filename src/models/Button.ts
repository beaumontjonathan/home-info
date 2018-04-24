import * as onoff from 'onoff';
import {EventEmitter} from 'events';

const Gpio = onoff.Gpio;

export enum BUTTON_STATE {
    DOWN = 1,
    UP = 0,
    UNKNOWN = -1
}

export class Button {
    private button: any;
    private events: EventEmitter;
    private latestState: BUTTON_STATE;
    private state: BUTTON_STATE;
    private lastDown: number;
    private blocked: boolean;
    public pin: number;
    private static readonly BUTTON_DEBOUNCE = 200;
    private static readonly EVENTS = {
        STATE_CHANGED: 'state-changed',
        BUTTON_PRESSED: 'button-pressed'
    };

    constructor(pin: number) {
        this.pin = pin;
        this.blocked = false;
        this.events = new EventEmitter();
        this.button = new Gpio(pin, 'in', 'both');
        this.button.watch(this.handleWatchEvent.bind(this));
    }

    private handleWatchEvent(err: Error, state: number): void {
        if (err) throw err;
        const now = Date.now();
        if (state === BUTTON_STATE.DOWN && !this.blocked) {
            this.blocked = true;
            if (this.lastDown === undefined || now - this.lastDown > Button.BUTTON_DEBOUNCE) {
                this.events.emit(Button.EVENTS.BUTTON_PRESSED);
            }
            this.lastDown = now;
        }
        this.blocked = false;
    }

    public waitForPress(): Promise<void> {
        return new Promise<void>(resolve => {
            this.events.once(Button.EVENTS.BUTTON_PRESSED, () => {
                resolve();
            });
        });
    }

    public closeButton() {
        this.button.unexport();
    }
}