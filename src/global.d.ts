declare const APP: {
    getBaseEntity: () => string;
    isCard: () => boolean;
    getWidgetsArea: () => string;
    getV3WidgetsArea: () => string;
    constant: <T>(param: string) => T;
}

declare module '*.vue';
declare module '*.sass';