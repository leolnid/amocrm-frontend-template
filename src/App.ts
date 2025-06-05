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
        return true;
    }
}