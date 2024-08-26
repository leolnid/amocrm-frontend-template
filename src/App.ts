import { BaseApp } from "./BaseApp";

export default class App extends BaseApp {
    public onRender(): boolean {
        /** @ts-ignore */
        const area = APP.getV3WidgetsArea();

        console.debug('Был вызван метод RENDER из локации ' + area)

        return true;
    }

    public async onSettings(): Promise<boolean> {
        // @ts-ignore
        console.debug(await this.render('advanced_settings', {title: 'Привет!', ...this.amoWidget.params}), 'Тестирование twig')
        return true;
    }
}