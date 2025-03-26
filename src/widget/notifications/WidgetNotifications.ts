import {INotification} from "./components/types.ts";
import {Component, createApp, Ref, ref} from "vue";
import Notification from "./components/Notification.vue";
import WidgetLocalStorage from "../storage/local/WidgetLocalStorage.ts";
import {WidgetDomainApi} from "../api/WidgetBaseApi.ts";
import $ from "jquery";
import Notifications from "./components/Notifications.vue";
import {BaseSingleton} from "../../BaseSingleton.ts";
import App from "../../App.ts";

export default class WidgetNotifications<T = INotification> extends BaseSingleton<WidgetNotifications> {
    path = '/notifications';
    private list: Ref<T[]> = ref([]);
    component = Notification;

    protected constructor(path?: string, component?: Component, notifications?: T[]) {
        super();
        if (path) this.path = path;
        if (component) this.component = component;
        if (notifications) this.notifications = notifications;
    }

    get notifications() {
        return this.list.value;
    }

    set notifications(list: T[]) {
        this.list.value = list;
    }

    async getRemoteNotifications(): Promise<T[]> {
        if (!WidgetLocalStorage.isLocalDataExpired(WidgetLocalStorage.get('notifications'), 1, 'h')) return [];
        WidgetLocalStorage.set('notifications');
        try {
            const n = await WidgetDomainApi.I.get<T[]>(this.path);
            this.pushNotifications(...n);
            return n;
        } catch (err) {
            WidgetLocalStorage.remove('notifications');
            console.error(err);
        }
        return [];
    }

    public pushNotifications(...args: T[]) {
        this.list.value.push(...args);
    }

    public showNotifications() {
        const $pageHolder = $('#page_holder');
        let $container = $pageHolder.find(`#${App.I.code}-notifications`);
        if ($container.length) return;
        $container = $pageHolder
            .append(`<div class="${App.I.code}-notifications-wrapper" id="${App.I.code}-notifications"/>`)
            .find(`#${App.I.code}-notifications`);
        $container[0].style.cssText = `
          position: absolute;
          left: 0;
          bottom: 0;
          top: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 10000;
        `;
        const self = this;
        const app = createApp(Notifications, {
            notifications: self.notifications,
            notificationComponent: self.component,
            onHide(id: string | number) {
                try {
                    WidgetDomainApi.I.post(self.path + '/' + id);
                } catch (err) {
                    console.error(err);
                }
            },
            onHideAll() {
                self.notifications = [];
            }
        });
        app.mount($container[0]);
    }
}