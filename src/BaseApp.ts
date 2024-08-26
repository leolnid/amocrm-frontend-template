export class BaseApp {
    protected amoWidget: unknown;
    protected mode: string;

    constructor(amoWidget: unknown, mode: string) {
        this.amoWidget = amoWidget;
        this.mode = mode;
    }

    public getCallbacks(): Record<string, () => boolean | unknown> {
        const self = this;
        const methodsMap = {
            init: 'onInit',
            bind_actions: 'onBindActions',
            render: 'onRender',
            dpSettings: 'onDigitalPipelineSettings',
            settings: 'onSettings',
            advancedSettings: 'onAdvancedSettings',
            onSave: 'onSave',
            destroy: 'onDestroy',
            onAddAsSource: 'onAddAsSource',
        }

        return Object.fromEntries(Object.entries(methodsMap)
            // @ts-ignore
            .map(([key, callback]) => [key, typeof self[callback] === 'function' ? self[callback].bind(self) : self.defaultCallback.bind(self)]))
    }

    public defaultCallback(): boolean {
        return true;
    }

    public render(template: string, params: Record<string | number, unknown> = {}): Promise<string> {
        params = (typeof params == 'object') ? params : {};
        template = template || '';

        return new Promise(resolve => {
            // @ts-ignore
            this.amoWidget.render.call(this.amoWidget, {
                href: '/templates/' + template + '.twig',
                // @ts-ignore
                base_path: this.amoWidget.get_settings()?.path,
                load: (template: { render: ({}) => string }) => resolve(template.render(params))
            }, params);
        })
    };
}