import $ from "jquery";
import BaseWidget from "../BaseWidget.ts";
import {Component, createApp} from "vue";
import {BaseSingleton} from "../../BaseSingleton.ts";
import App from "../../App.ts";
import {WidgetJquery} from "../jquery/WidgetJquery.ts";


export default class WidgetPageModifier extends BaseSingleton<WidgetPageModifier> {
    public static addStyleSheet(name?: string) {
        $('head').append(
            `<link type="text/css" rel="stylesheet" href="${App.I.path}/${
                name ?? App.I.styleFile
            }?v=${App.I.production ? App.I.version : Date.now()}" >`
        );
    }

    public static render(template: string, params: Record<string | number, unknown> = {}): string {
        params = (typeof params == 'object') ? params : {};
        template = template || '';

        return App.I.amoWidget.render({ref: `/tmpl/controls/${template}.twig`}, params);
    };

    public static setSettingsTab(title: string, tab: string, component?: Component): JQuery | undefined {
        const $wrap = App.I.amoWidget.modal?.$modal ?? $(`div.modal.${BaseWidget.I.code}`);
        let $input = $wrap.find(`input#${tab}`);
        if ($input.length) return;
        $wrap.find('label[for="description"]')
            .after(`<label style="margin: 0;" class="tabs__item view-integration-modal__tab-${tab}" for="${tab}">${title}</label>`)
            .after(`<input type="radio" name="type_integration_modal" id="${tab}" class="hidden tabs__input">`);

        $wrap.find('.widget-settings__wrap-desc-space').append(`<div class="view-integration-modal__${tab}"></div>`);

        const $page = $wrap.find(`.view-integration-modal__${tab}`).addClass('hidden');
        $input = $wrap.find(`input#${tab}`);

        if (component) createApp(component).mount($page[0]);

        $input.on('click', () => WidgetPageModifier.changePage($wrap, tab));
        const $tabs = $wrap.find('.view-integration-modal__tabs .tabs').css('width', '100%').find('.tabs__item');
        $tabs.css('flex', '1').css('text-align', 'center').each((_: number, el: HTMLElement) => {
            el.style.setProperty('margin', '0', 'important')
        });
        $tabs.filter(`:not(.view-integration-modal__${tab})`).on('click', () => {
            $page.addClass('hidden');
        });
        return $page;
    }

    public static changePage($wrap: JQuery, tab: string): void {
        $wrap.find('div.view-integration-modal__access').off('click');
        $wrap.find('div.view-integration-modal__access div.integration-users-list__list').empty();
        $wrap.find(`div.view-integration-modal__${tab}`)
            .removeClass('hidden');

        $wrap.find('div.widget-settings__wrap-desc-space')
            .children().not(`:first, .view-integration-modal__${tab}, #makeroi-widget-footer`)
            .addClass('hidden');
    }

    public static addFrame(url: string, wrapper: HTMLElement | JQuery) {
        const $wrapper: JQuery = $(wrapper);
        console.debug({url, $wrapper})
        $wrapper.append(`
            <iframe name="${App.I.code}-frame" src="${url}" style="width: 100%; height: 100%; flex: 1;"/>
        `);
        return $wrapper.find(`iframe[name="${App.I.code}-frame"]`) as JQuery<HTMLIFrameElement>;
    }

    public static addSubmenuPage(pageId: string, title: string = App.I.amoWidget.langs.widget.name): JQuery {

        if ($(`#${pageId}`).length) return $();
        const $submenu: JQuery = $('#sidebar.aside, .aside[id^="sidebar_"]').find('#filter_presets_holder ul.filter__list');
        $submenu.append(`
            <li class="aside__list-item  js-filter-preset-link" title="${title}">
                <a href="${location.href.replace(location.origin, '')}" class="aside__list-item-link navigate-link-nodecor h-text-overflow js-navigate-link">
                    ${title}
                </a>
            </li>
        `);
        const $button = $submenu.find(`li[title="${title}"]`);
        const $selected = $submenu.find('.aside__list-item_selected');
        const $pageHolder = $('#page_holder');
        const $startVisible = $pageHolder.children(':not(.hidden)');
        $pageHolder.css('display', 'flex').css('flex-direction', 'column');
        $pageHolder.append(`
            <div class="work-area hidden" id="${pageId}">
                <div class="menu-button" style="display: none; cursor: pointer; position: absolute; top: 0; left: 0; padding: 23px; background: white; border-bottom-right-radius: 8px; box-shadow: 4px 4px 12px 0 rgba(0,0,0,0.1)">
                    <span class="icon icon-list filter-toggle-icon"></span>
                </div>
            </div>
        `);
        const $menu = $startVisible.find(`#sidebar_toggler.sidebar_toggler`);
        const $wrap = $pageHolder.find(`#${pageId}`);
        $wrap
            .css('display', 'flex')
            .css('flex', 1)
            .css('flex-direction', 'column')
            .css('padding', 0)
            .css('height', '100%');
        WidgetPageModifier.addMediaQueryStyle(
            "@media (max-width: 1279px)",
            `#${pageId} .menu-button { display: block !important; }`
        );
        WidgetPageModifier.addMediaQueryStyle(
            "@media (max-width: 1279px)",
            `#${pageId} { margin-left: 0 !important; }`
        );
        $wrap.find('.menu-button').on('click', () => {
            console.debug({$menu});
            $menu.trigger('click');
        })

        $button.on(`click.${App.I.code}`, () => {
            $submenu.children().removeClass('aside__list-item_selected');
            $pageHolder.children(':not(#sidebar.aside, .aside[id^="sidebar_"])').addClass('hidden');
            $button.addClass('aside__list-item_selected');
            $wrap.removeClass('hidden');
        });


        if (!WidgetJquery.hasEventHandlerWithNamespace($selected[0], 'click')) {
            $selected.on(`click.${App.I.code}`, () => {
                $pageHolder.children(':not(#sidebar.aside, .aside[id^="sidebar_"])').addClass('hidden');
                $submenu.children().removeClass('aside__list-item_selected');
                $selected.addClass('aside__list-item_selected');
                $startVisible.removeClass('hidden');
            });
        }

        return $wrap;
    }

    public static addMediaQueryStyle(mediaQuery, styles) {
        const style = document.createElement("style");
        style.textContent = `${mediaQuery} { ${styles} }`;
        document.head.appendChild(style);
    }
}