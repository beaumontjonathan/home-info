import * as rp from 'request-promise';
import * as moment from 'moment';
import { EventEmitter } from 'events';

export class BusStop {
    private static readonly UPDATE_INTERVAL_SECONDS = 10;

    private updateInterval: number;
    private events: EventEmitter;
    public busDepartures: any[];

    constructor() {
        this.events = new EventEmitter();
        this.busDepartures = [];
        this.startUpdateInterval();
    }

    private startUpdateInterval() {
        this.updateArrivalData();
        this.updateInterval = setInterval(this.updateArrivalData.bind(this), BusStop.UPDATE_INTERVAL_SECONDS * 1000);
    }

    private async updateArrivalData() {
        const data: BusStopResponse = await rp({
            method: 'GET',
            json: true,
            uri: url
        });
        this.processBusStopResponse(data);
    }

    private processBusStopResponse(data: BusStopResponse): void {
        if (!data || !data.times) return;

        const times = data.times;
        const departures = times
            .filter(dep => dep.IsLive = 'Y')
            .map(dep => {
                return {
                    routeName: dep.ServiceNumber,
                    estimatedDepartureTime: this.formatDepartureTime(dep.Due)
                };
            });
        this.busDepartures = departures;
        this.events.emit('updated-departures');
    }

    public waitForNewDepartures() {
        return new Promise(resolve => {
            this.events.once('updated-departures', () => {
                resolve();
            });
        });
    }

    private formatDepartureTime(dep: string): string {
        if (dep.includes(':')) {
            const parts = dep.split(':');
            if (parts.length !== 2) return dep;
            const now = moment();
            const then = moment();
            then.hours(parseInt(parts[0]));
            then.minutes(parseInt(parts[1]));
            let newDep;
            let minutesDif = (+then - +now) / 60000;
            if (minutesDif < 0) {
                then.date(then.date() + 1);
                minutesDif = (+then - +now) / 60000;
            }
            newDep = `${Math.round(minutesDif)} mins`;
            return newDep;
        } else {
            return dep;
        }
    }
}

export type BusStopResponse = {
    atcocode: string
    smscode: string
    request_time: string
    name: string
    bearing: string
    indicator: string
    locality: string
    location: {
        type: string
        coordinates: [number, number]
    }
    departures: object
    source: string
    times: {
        ServiceRef: string
        ServiceNumber: string // U2 / 1
        Destination: string
        Due: string // Due now / 10 mins
        IsFG: string // Y/N
        IsLive: string //Y/N
    }[]
    stop: {
        code: string
        mark: string
        direction: string
        latitude: string
        longitude: string
        indicator: string
        name: string
        locality: string
        qualifier: string
    }
    fromTraveline: string // DD/MM/YYYY hh:mm
}

const url = 'https://www.firstgroup.com/getNextBus?stop=0180BAC30294';
//const url = 'http://transportapi.com/v3/uk/bus/stop/0180BAC30294/live.json?app_id=a48c7d2d&app_key=16afbe976ee991141e25c97aba419c92';