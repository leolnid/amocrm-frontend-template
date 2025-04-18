import {BaseSingleton} from "../../BaseSingleton.ts";
import App from "../../App.ts";

interface ResponseBody<T> {
    data: T | {message: string};
    success: boolean;
}

class ApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'ApiError';
    }
}

export enum RequestType {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DEL = 'DELETE',
}

export class WidgetBaseApi extends BaseSingleton<WidgetBaseApi> {
    static #createQueryString(data?: object): string {
        if (!data) return ''
        return Object.keys(data).map(key => {
            //@ts-ignore
            let val = data[key];
            if (val !== null && typeof val === 'object') val = WidgetBaseApi.#createQueryString(val)
            return `${key}=${encodeURIComponent(`${val}`.replace(/\s/g, '_'))}`
        }).join('&');
    }

    protected _requestFunc: typeof $.ajax = $.ajax;

    static #makeHeaders(headers?: Record<string, string>, cors = false): Record<string, string> {
        const corsHeaders: Record<string, string> = cors ? {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Origin, Accept, Authorization, Content-Length, X-Requested-With, X-Auth-Token',
            'Access-Control-Allow-Methods': 'POST, GET, PATCH, DELETE, OPTIONS'
        } : {};
        return { ...corsHeaders, ...headers };
    }

    public async request<T>(
        method: RequestType,
        path: string,
        query?: object,
        body?: any,
        headers?: Record<string, string>,
        contentType = 'application/json',
        dataType = 'json',
        cors?: boolean
    ): Promise<T> {
        const queryString = WidgetBaseApi.#createQueryString(query);
        const url = path + (queryString ? (path.includes('?') ? '&' : '?') + queryString : '');
        const requestHeaders = WidgetBaseApi.#makeHeaders(headers, cors);
        const data = contentType === 'application/json' ? JSON.stringify(body) : body;

        return new Promise<T>((resolve, reject) => this._requestFunc({
            url,
            type: method,
            contentType,
            headers: requestHeaders,
            dataType,
            data,
            success: function (data: ResponseBody<T>/*, statusText: string, xhr: JQueryXHR*/) {
                if (data === undefined) return reject(new ApiError('Получили пустой ответ от сервера', 404));
                // @ts-ignore
                if (!data.success || !('data' in data)) return reject(new ApiError(data.data?.message ?? `Неизвестная ошибка`));
                resolve(data.data as T);
            },
            //@ts-ignore
        }).fail(function (request: { status: number, responseJSON?: ResponseBody }, status: string, error: string) {
            reject(new ApiError(request.responseJSON?.data?.message ?? error ?? `Неизвестная ошибка`, request.status));
        }));
    }
    get = async <T>(
        path: string,
        query?: object,
        headers?: Record<string, string>,
        contentType?: string,
        dataType?: string,
        cors?: boolean
    ): Promise<T> => this.request<T>(RequestType.GET, path, query, undefined, headers, contentType, dataType, cors);
    post = async <T>(
        path: string,
        query?: object,
        body?: any,
        headers?: Record<string, string>,
        contentType?: string,
        dataType?: string,
        cors?: boolean
    ): Promise<T> => this.request<T>(RequestType.POST, path, query, body, headers, contentType, dataType, cors);
    put = async <T>(
        path: string,
        query?: object,
        body?: any,
        headers?: Record<string, string>,
        contentType?: string,
        dataType?: string,
        cors?: boolean
    ): Promise<T> => this.request<T>(RequestType.PUT, path, query, body, headers, contentType, dataType, cors);
    patch = async <T>(
        path: string,
        query?: object,
        body?: any,
        headers?: Record<string, string>,
        contentType?: string,
        dataType?: string,
        cors?: boolean
    ): Promise<T> => this.request<T>(RequestType.PATCH, path, query, body, headers, contentType, dataType, cors);
    del = async <T>(
        path: string,
        query?: object,
        body?: any,
        headers?: Record<string, string>,
        contentType?: string,
        dataType?: string,
        cors?: boolean
    ): Promise<T> => this.request<T>(RequestType.DEL, path, query, body, headers, contentType, dataType, cors);
}

export class WidgetAuthorizedApi extends WidgetBaseApi {
    protected constructor() {
        super();
        this._requestFunc = App.I.$ajax;
    }
}

export class WidgetDomainApi extends WidgetAuthorizedApi {
    public request = async <T>(
        method: RequestType,
        path: string,
        query?: object,
        body?: any,
        headers?: Record<string, string>,
        contentType?: string,
        dataType?: string,
        cors?: boolean
    ) => WidgetBaseApi.I.request<T>(method, App.I.backendDomain + path, query, body, headers, contentType, dataType, cors);
}
