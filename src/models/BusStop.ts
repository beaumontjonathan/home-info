import * as rp from 'request-promise';
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
                    estimatedDepartureTime: dep.Due
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
rp({
    uri: url,
    method: 'POST',
    body: 'stop=0180BAC30294',
    json: true
}).then(d => console.log('data!', d)).catch(e => console.log('error :(', e.message));
//const url = 'http://transportapi.com/v3/uk/bus/stop/0180BAC30294/live.json?app_id=a48c7d2d&app_key=16afbe976ee991141e25c97aba419c92';