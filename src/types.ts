


export interface AmoWidget<T extends Record<string, any> = {}> {
    modal?: {
        $el: unknown,
        $modal: unknown
    },
    params: {
        active: "Y" | "N",
        id: number,
        oauth_client_uuid: string,
        widget_code: string,
        path: string,
    } & T,
    langs: {
        widget: {
            description: string, // HTML
            name: string,
            short_description: string,
            tour_description: string,
        }
    }
    $authorizedAjax: typeof jQuery.ajax,
    render: (data: {ref: string}, params?: Record<string | number, unknown>) => string,
}