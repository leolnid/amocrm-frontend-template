
import BaseWidget from "./widget/BaseWidget.ts";

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