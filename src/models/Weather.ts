import * as rp from 'request-promise';
import { EventEmitter } from 'events';


export class Weather {
    private static readonly UPDATE_INTERVAL_SECONDS = 10;

    public temperature: number;
    private updateInterval: number;
    private events: EventEmitter;

    constructor() {
        this.events = new EventEmitter();
        this.startUpdateInterval();
    }

    private startUpdateInterval() {
        this.updateWeatherData();
        this.updateInterval = setInterval(this.updateWeatherData.bind(this), Weather.UPDATE_INTERVAL_SECONDS * 1000);
    }

    private async updateWeatherData() {
        const data: OpenWeatherMapResponse = await rp({
            method: 'GET',
            json: true,
            uri: 'http://api.openweathermap.org/data/2.5/weather?q=Bath,uk&appid=370dd1200a67d1b435b8f17cbe2f6161&units=metric'
        });
        if (data.main.temp) {
            this.temperature = data.main.temp;
            this.events.emit('weather-updated');
        }
    }

    public waitForWeatherUpdate(): Promise<void> {
        return new Promise<void>(resolve => {
            this.events.once('weather-updated', () => {
                resolve();
            });
        });
    }
}

export type OpenWeatherMapResponse = {
    coord: {
        lon: number
        lat: number
    }
    weather: {
        id: number
        main: string
        description: string
        icon: string
    }[]
    base: string
    main: {
        temp: number
        pressure: number
        humidity: number
        temp_min: number
        temp_max: number
    }
    wind: {
        speed: number
        deg: number
    }
    clouds: {
        all: number
    }
    dt: number
    sys: {
        type: number
        id: number
        message: number
        country: string
        sunrise: number
        sunset: number
    }
    id: number
    name: string
    cod: number
}


async function start() {
    const weather: Weather = new Weather();
    while(true) {
        await weather.waitForWeatherUpdate();
        console.log(weather.temperature);
    }
}

start();