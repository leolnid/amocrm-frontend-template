import {AmoWidget} from "./Interfaces/AmoWidget.ts";
import $ from "jquery"

export class BaseApp {
    protected amoWidget: AmoWidget;
    protected mode: string;
    styleFile = 'style.css';
    readonly version = '0.0.2';
    readonly production: boolean = true;

    constructor(amoWidget: AmoWidget, mode: string) {
        this.amoWidget = amoWidget;
        this.mode = mode;
        this.production = (mode === 'production');
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
        }

        return Object.fromEntries(Object.entries(methodsMap)
            .map(([key, callback]) => {
                const baseCallbackName = ('on' + callback) as keyof BaseApp;
                const defaultCallbackName = ('onBefore' + callback) as keyof BaseApp;
                const originalCallback =
                    typeof self[baseCallbackName] === "function"
                        ? (self[baseCallbackName] as () => any).bind(self)
                        : self.defaultCallback.bind(self);

                const newCallback = () => {
                    this.onBeforeCallback.bind(self)();
                    if (typeof self[defaultCallbackName] === 'function') (self[defaultCallbackName] as () => any).bind(self)();
                    return originalCallback();
                };

                return [key, newCallback];
            }))
    }

    private addStyleSheet(name?: string) {
        $('head').append(
            `<link type="text/css" rel="stylesheet" href="${this.getPath()}/${
                name ?? this.styleFile
            }?v=${this.production ? this.getVersion() : Date.now()}" >`
        );
    }

    private onBeforeCallback() {
        this.addStyleSheet();
    }

    public defaultCallback(): boolean {
        return true;
    }

    public render(template: string, params: Record<string | number, unknown> = {}): string {
        params = (typeof params == 'object') ? params : {};
        template = template || '';

        return this.amoWidget.render({ref: `/tmpl/controls/${template}.twig`}, params);
    };

    public getCode(): string {
        return this.amoWidget.params.widget_code;
    }
    public getPath(): string {
        return this.amoWidget.params.path;
    }
    public getVersion(): string {
        return this.version ?? '0.0.1'
    }
}