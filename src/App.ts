import Feedback from "./components/Feedback.vue";
import BaseWidget from "./widget/BaseWidget.ts";
import WidgetPageModifier from "./widget/page/WidgetPageModifier.ts";
import {WidgetDomainApi} from "./widget/api/WidgetBaseApi.ts";
import WidgetLocalStorage from "./widget/storage/local/WidgetLocalStorage.ts";
import $ from "jquery";

interface Dashboard {
    id: any,
    name: string,
    link: string,
}

export default class App extends BaseWidget {
    styleFile = 'template.css'
    backendDomain = 'http://localhost:3333/amolens';

    dashboards: Dashboard[] | undefined;

    public onRender(): boolean {
        console.table({
            getV3WidgetsArea: APP.getV3WidgetsArea(),
            getWidgetsArea: APP.getWidgetsArea(),
            getBaseEntity: APP.getBaseEntity(),
        });
        const area = APP.getWidgetsArea();
        console.debug('Был вызван метод RENDER из локации ' + area);
        return true;
    }

    async onStatsRender() {
        const area = APP.getWidgetsArea();
        console.debug({area, events: area === 'events', stats:  area.includes('stats')});
        if (area === 'events' || area.includes('stats')) {
            if (!this.dashboards) {
                const localData = WidgetLocalStorage.get<Dashboard[]>('dashboards');
                if (!Array.isArray(localData?.data) || WidgetLocalStorage.isLocalDataExpired(localData, 1, 'h')) {
                    try {
                        this.dashboards = await WidgetDomainApi.I.get<Dashboard[]>('/settings/dashboards');
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    this.dashboards = localData.data;
                }
            }

            $('#sidebar, #sidebar_events').find('#filter_presets_holder ul.filter__list li[title="AmoLENS submenu"]').addClass('hidden');
            this.dashboards?.forEach(dashboard => {
                const $page = WidgetPageModifier.addSubmenuPage(`${this.code}_${dashboard.id}`, dashboard.name);
                if ($page.length) WidgetPageModifier.addFrame(dashboard.link, $page);
            });
        }
    }

    public async onSettings(): Promise<boolean> {
        WidgetPageModifier.setSettingsTab('Обратная связь', 'feedback', Feedback);
        return true;
    }

    async onAdvancedSettings(...args: any[]): Promise<boolean> {
        const $pageHolder = $('#page_holder')
            .css('display', 'flex')
            .css('flex-direction', 'column');

        const $workArea = $pageHolder.find('#work_area')
            .css('flex', 1)
            .css('padding', 0)
            .css('display', 'flex')
            .css('flex-direction', 'column');

        $workArea.children().addClass('hidden');
        $workArea
            .find('.content__top')
            .removeClass('hidden')
            .css('position', 'absolute')
            .css('margin-left', 28)
            .find('.content__top__preset').addClass('hidden');

        try {
            const $sidebar = $('#sidebar');
            const data = await WidgetDomainApi.I.get<{url: string, jwt: string}>('/frame');
            const url = (
                data.url.endsWith('/') ? data.url : data.url + '/')
                + (location.hash ?? '#databases') + ('?jwt=' + data.jwt)
                + ('&moved=' + ($sidebar.css('left')?.[0] === '-')
                + ('&code=' + this.code));
            const $frame = WidgetPageModifier.addFrame(url, $workArea);
        } catch (err) {
            return false;
        }
        return true;
    }

    onInitMenuPage() {
        const $workArea = $('#page_holder #work_area');
        if ($workArea.find('.helper-message').length) return true;
        $workArea.append(`
            <div class="helper-message" style="
                background: white;
                padding: 20px 28px;
                font-size: 1.4em;
                border-radius: 16px;
                width: 560px;
                margin: auto;
                box-shadow: 0 6px 40px rgb(0, 0, 0, 0.05);
            ">
                Если вы видите это сообщение, значит, что дашборды виджета "${this.name}" не успели загрузиться или не загрузились вовсе. Поробуйте найти их в <u class="menu-opener" style="cursor: pointer;">меню</u> или <u style="cursor: pointer;" class="page-reloader">перезагрузите страницу</u>
            </div>
        `);
        const $message = $workArea.find('.helper-message');
        const $menuButton = $('#sidebar_toggler.sidebar_toggler');
        $message.find('.menu-opener').on('click', () => {
            $menuButton.trigger('click');
        });
        $message.find('.page-reloader').on('click', () => {
            location.reload();
        });
        return true;
    }
}