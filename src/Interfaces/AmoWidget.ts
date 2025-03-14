export interface AmoWidget {
    modal: {
        $el: JQuery,
        $modal: JQuery
    },
    params: {
        active: "Y" | "N",
        id: number,
        oauth_client_uuid: string,
        widget_code: string,
        path: string,
    }
    $authorizedAjax: (data: {url: string, [p: string]: any}) => unknown,
    render: (data: {ref: string}, params?: Record<string | number, unknown>) => string,
}