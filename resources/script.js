define([`./scripts/App.js?cache=${Date.now()}`], function (app) {
    return function () {
        console.debug('===================[ WIDGET ]================\n\nДата сборки: {build_date}\n\n');

        // eslint-disable-next-line
        const self = this;
        self.system = this.system();
        self.langs = this.langs;

        self.app = new app(self, 'production');
        self.callbacks = self.app.getCallbacks();

        console.debug('Собрали callbacks: ' + Object.keys(self.callbacks));
        return self;
    };
});
