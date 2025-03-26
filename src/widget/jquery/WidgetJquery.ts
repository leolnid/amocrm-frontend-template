import {BaseSingleton} from "../../BaseSingleton.ts";
import App from "../../App.ts";

export class WidgetJquery extends BaseSingleton<WidgetJquery> {
    public static hasEventHandlerWithNamespace(element: HTMLElement, eventType: string, namespace: string = App.I.code) {
        const events = $._data(element, "events");

        if (events && events[eventType]) {
            for (let i = 0; i < events[eventType].length; i++) {
                if (events[eventType][i].namespace === namespace) {
                    return true;
                }
            }
        }

        return false;
    }
}