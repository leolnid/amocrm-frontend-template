import {BaseSingleton} from "../../../BaseSingleton.ts";
import App from "../../../App.ts";

interface BaseLocalData<T = unknown> {
    data: T,
    timestamp: ReturnType<typeof Date.now>,
}

export default class WidgetLocalStorage extends BaseSingleton<WidgetLocalStorage> {
    public static set(key: string, data?: any) {
        let value = {[key]: {data, timestamp: Date.now()}};
        const storage = localStorage.getItem(`${App.I.code}`);
        if (storage) {
            value = Object.assign(JSON.parse(storage), value);
        }
        localStorage.setItem(`${App.I.code}`, JSON.stringify(value));
    }
    public static get<T>(key: string): BaseLocalData<T> | undefined {
        const storage = localStorage.getItem(`${App.I.code}`);
        if (!storage) return undefined;
        return JSON.parse(storage)[key] as BaseLocalData<T>;
    }
    public static remove(key: string) {
        const storage = localStorage.getItem(`${App.I.code}`);
        if (!storage) return;
        const json = JSON.parse(storage);
        delete json[key];
        localStorage.setItem(`${App.I.code}`, JSON.stringify(json));
    }

    public static isLocalDataExpired(data: BaseLocalData | undefined, timeout: number, units: 'ms' | 's' | 'm' | 'h' = 'ms') {
        if (!data?.timestamp) return true;
        let interval: number;
        switch (units) {
            case "s":
                interval = timeout * 1000;
                break;
            case "m":
                interval = timeout * 60000;
                break;
            case "h":
                interval = timeout * 3600000;
                break;
            default:
                interval = timeout;
                break;
        }
        return interval < Date.now() - data.timestamp;
    }
}