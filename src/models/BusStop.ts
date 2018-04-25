import * as rp from 'request-promise';
import { EventEmitter } from 'events';

export class BusStop {
    private static readonly UPDATE_INTERVAL_SECONDS = 10;

    private updateInterval: number;
    private events: EventEmitter;
    public busDepartures: BusDeparture[];

    constructor() {
        this.events = new EventEmitter();
        this.busDepartures = [];
        this.startUpdateInterval();
    }

    private startUpdateInterval() {
        this.updateArrivalData();
        this.updateInterval = setInterval(this.updateArrivalData.bind(this), 5000);
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
        const dataU2: BusStopDepartureResponse = data.departures['U2'] || [];
        const data1: BusStopDepartureResponse = data.departures['1'] || [];
        const allData: BusStopDepartureResponse = dataU2.concat(data1);
        const departures: BusDeparture[] = allData
            .map(dep => {
                return {
                    routeName: dep.line_name,
                    date: dep.date,
                    estimatedDepartureTime: dep.best_departure_estimate
                };
            })
            .sort(({date: d1, estimatedDepartureTime: t1}, {date: d2, estimatedDepartureTime: t2}) => {
                return +new Date(`${d1} ${t1}`) - +new Date(`${d2} ${t2}`);
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
    stop_name: string
    bearing: string
    indicator: string
    locality: string
    location: {
        type: string
        coordinates: [number, number]
    }
    departures: BusStopDeparturesResponse
    source: string
}

export type BusStopDeparturesResponse = {
    U2: BusStopDepartureResponse
    1: BusStopDepartureResponse
}

export type BusStopDepartureResponse = {
    mode: string
    line: string
    line_name: string
    direction: string
    operator: string
    date: string
    expected_departure_date: null
    aimed_departure_time: string
    expected_departure_time: null
    best_departure_estimate: string
    source: string
    dir: string
    id: string
    operator_name: null
}[]

export type BusDeparture = {
    routeName: string
    date: string
    estimatedDepartureTime: string
}

const url = 'http://transportapi.com/v3/uk/bus/stop/0180BAC30294/live.json?app_id=f366ed6e&app_key=8a53da7e0c5fee4164410f3aede9439e';