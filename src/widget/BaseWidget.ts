import {AmoWidget} from "../types.ts";
import WidgetNotifications from "./notifications/WidgetNotifications.ts";
import WidgetPageModifier from "./page/WidgetPageModifier.ts";
import {BaseSingleton} from "../BaseSingleton.ts";

export default class BaseWidget<T extends Record<string, any> = {}> extends BaseSingleton<BaseWidget<T>> {
    amoWidget: AmoWidget<T>;
    protected readonly mode: string;
    styleFile = 'style.css';
    readonly version = '1.0.0';
    readonly production = true;
    backendDomain: string = '';
    //
    protected constructor(amoWidget: AmoWidget<T>, mode: string) {
        if (!amoWidget) throw new Error('param amoWidget is required for BaseWidget');
        super();
        this.amoWidget = amoWidget;
        this.mode = mode;
    }

    public getCallbacks(): Record<string, () => boolean | unknown> {
        const self = this;
        const methodsMap = {
            init: 'Init',
            bind_actions: 'BindActions',
            render: 'Render',
            dpSettings: 'DigitalPipelineSettings',
            settings: 'Settings',
            advancedSettings: 'AdvancedSettings',
            onSave: 'Save',
            destroy: 'Destroy',
            onAddAsSource: 'AddAsSource',
            initMenuPage: 'InitMenuPage',
        }

        return Object.fromEntries(Object.entries(methodsMap)
            .map(([key, callback]) => {
                const baseCallbackName = ('on' + callback) as keyof typeof this;
                const defaultCallbackName = ('onBefore' + callback) as keyof typeof this;
                const originalCallback =
                    typeof self[baseCallbackName] === "function"
                        ? (self[baseCallbackName] as () => any).bind(self)
                        : self.defaultCallback.bind(self);

                const newCallback = (...args: any[]) => {
                    this.onBeforeCallback.bind(self)();
                    //@ts-ignore
                    if (typeof self[defaultCallbackName] === 'function') (self[defaultCallbackName] as () => any).bind(self)(...args);
                    //@ts-ignore
                    return originalCallback(...args);
                };

                return [key, newCallback];
            }))
    }
    //
    private onBeforeCallback() {
        WidgetPageModifier.addStyleSheet();
        WidgetNotifications.I.getRemoteNotifications();
        WidgetNotifications.I.showNotifications();
    }

    public defaultCallback(): boolean {
        return true;
    }

    public render(template: string, params: Record<string | number, unknown> = {}): string {
        params = (typeof params == 'object') ? params : {};
        template = template || '';

        return this.amoWidget.render({ref: `/tmpl/controls/${template}.twig`}, params);
    };

    public get code(): string {
        return this.amoWidget.params.widget_code;
    }
    public get path(): string {
        return this.amoWidget.params.path;
    }
    public get name(): string {
        return this.amoWidget.langs.widget.name
    }
    public get $ajax(): typeof $.ajax {
        return this.amoWidget.$authorizedAjax.bind(this.amoWidget);
    }
}