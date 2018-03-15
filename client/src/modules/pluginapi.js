/**
 * BetterDiscord Plugin Api
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Utils, ClientLogger as Logger, ClientIPC } from 'common';
import Settings from './settings';
import ExtModuleManager from './extmodulemanager';
import PluginManager from './pluginmanager';
import ThemeManager from './thememanager';
import Events from './events';
import EventsWrapper from './eventswrapper';
import { WebpackModules } from './webpackmodules';
import { SettingsSet, SettingsCategory, Setting, SettingsScheme } from 'structs';
import { BdMenuItems, Modals, DOM } from 'ui';
import SettingsModal from '../ui/components/bd/modals/SettingsModal.vue';

export default class PluginApi {

    constructor(pluginInfo) {
        this.pluginInfo = pluginInfo;
        this.Events = new EventsWrapper(Events);
        this._menuItems = undefined;
        this._injectedStyles = undefined;
        this._modalStack = undefined;
    }

    get plugin() {
        return PluginManager.getPluginById(this.pluginInfo.id || this.pluginInfo.name.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-').replace(/--/g, '-'));
    }

    async bridge(plugin_id) {
        const plugin = await PluginManager.waitForPlugin(plugin_id);
        return plugin.bridge;
    }

    get require() { return this.import }
    import(m) {
        const module = ExtModuleManager.findModule(m);
        if (module && module.__require) return module.__require;
        return null;
    }

    get Api() { return this }

    /**
     * Logger
     */

    loggerLog(...message) { Logger.log(this.pluginInfo.name, message) }
    loggerErr(...message) { Logger.err(this.pluginInfo.name, message) }
    loggerWarn(...message) { Logger.warn(this.pluginInfo.name, message) }
    loggerInfo(...message) { Logger.info(this.pluginInfo.name, message) }
    loggerDbg(...message) { Logger.dbg(this.pluginInfo.name, message) }
    get Logger() {
        return {
            log: this.loggerLog.bind(this),
            err: this.loggerErr.bind(this),
            warn: this.loggerWarn.bind(this),
            info: this.loggerInfo.bind(this),
            dbg: this.loggerDbg.bind(this)
        };
    }

    /**
     * Utils
     */

    get Utils() {
        return {
            overload: () => Utils.overload.apply(Utils, arguments),
            monkeyPatch: () => Utils.monkeyPatch.apply(Utils, arguments),
            monkeyPatchOnce: () => Utils.monkeyPatchOnce.apply(Utils, arguments),
            compatibleMonkeyPatch: () => Utils.monkeyPatchOnce.apply(Utils, arguments),
            tryParseJson: () => Utils.tryParseJson.apply(Utils, arguments),
            toCamelCase: () => Utils.toCamelCase.apply(Utils, arguments),
            compare: () => Utils.compare.apply(Utils, arguments),
            deepclone: () => Utils.deepclone.apply(Utils, arguments),
            deepfreeze: () => Utils.deepfreeze.apply(Utils, arguments)
        };
    }

    /**
     * Settings
     */

    createSettingsSet(args, ...merge) {
        return new SettingsSet(args || {}, ...merge);
    }
    createSettingsCategory(args, ...merge) {
        return new SettingsCategory(args, ...merge);
    }
    createSetting(args, ...merge) {
        return new Setting(args, ...merge);
    }
    createSettingsScheme(args) {
        return new SettingsScheme(args);
    }
    get Settings() {
        return {
            createSet: this.createSettingsSet.bind(this),
            createCategory: this.createSettingsCategory.bind(this),
            createSetting: this.createSetting.bind(this),
            createScheme: this.createSettingsScheme.bind(this)
        };
    }

    /**
     * InternalSettings
     */

    getInternalSetting(set, category, setting) {
        return Settings.get(set, category, setting);
    }
    get InternalSettings() {
        return {
            get: this.getInternalSetting.bind(this)
        };
    }

    /**
     * BdMenu
     */

    get BdMenu() {
        return {
            BdMenuItems: this.BdMenuItems
        };
    }

    /**
     * BdMenuItems
     */

    get menuItems() {
        return this._menuItems || (this._menuItems = []);
    }
    addMenuItem(item) {
        return BdMenuItems.add(item);
    }
    addMenuSettingsSet(category, set, text) {
        const item = BdMenuItems.addSettingsSet(category, set, text);
        return this.menuItems.push(item);
    }
    addMenuVueComponent(category, text, component) {
        const item = BdMenuItems.addVueComponent(category, text, component);
        return this.menuItems.push(item);
    }
    removeMenuItem(item) {
        BdMenuItems.remove(item);
        Utils.removeFromArray(this.menuItems, item);
    }
    removeAllMenuItems() {
        for (let item of this.menuItems)
            BdMenuItems.remove(item);
    }
    get BdMenuItems() {
        return Object.defineProperty({
            add: this.addMenuItem.bind(this),
            addSettingsSet: this.addMenuSettingsSet.bind(this),
            addVueComponent: this.addMenuVueComponent.bind(this),
            remove: this.removeMenuItem.bind(this),
            removeAll: this.removeAllMenuItems.bind(this)
        }, 'items', {
            get: () => this.menuItems
        });
    }

    /**
     * CssUtils
     */

    get injectedStyles() {
        return this._injectedStyles || (this._injectedStyles = []);
    }
    compileSass(scss, options) {
        return ClientIPC.send('bd-compileSass', Object.assign({ data: scss }, options));
    }
    getConfigAsSCSS(settingsset) {
        return ThemeManager.getConfigAsSCSS(settingsset ? settingsset : this.plugin.settings);
    }
    getConfigAsSCSSMap(settingsset) {
        return ThemeManager.getConfigAsSCSSMap(settingsset ? settingsset : this.plugin.settings);
    }
    injectStyle(id, css) {
        if (id && !css) css = id, id = undefined;
        this.deleteStyle(id);
        const styleid = `plugin-${this.plugin.id}-${id}`;
        this.injectedStyles.push(id);
        DOM.injectStyle(css, styleid);
    }
    async injectSass(id, scss, options) {
        // In most cases a plugin's styles should be precompiled instead of using this
        if (id && !scss && !options) scss = id, id = undefined;
        const css = (await this.compileSass(scss, options)).css.toString();
        this.injectStyle(id, css, options);
    }
    deleteStyle(id) {
        const styleid = `plugin-${this.plugin.id}-${id}`;
        this.injectedStyles.splice(this.injectedStyles.indexOf(styleid), 1);
        DOM.deleteStyle(styleid);
    }
    deleteAllStyles(id, css) {
        for (let id of this.injectedStyles) {
            this.deleteStyle(id);
        }
    }
    get CssUtils() {
        return {
            compileSass: this.compileSass.bind(this),
            getConfigAsSCSS: this.getConfigAsSCSS.bind(this),
            getConfigAsSCSSMap: this.getConfigAsSCSSMap.bind(this),
            injectStyle: this.injectStyle.bind(this),
            injectSass: this.injectSass.bind(this),
            deleteStyle: this.deleteStyle.bind(this),
            deleteAllStyles: this.deleteAllStyles.bind(this)
        };
    }

    /**
     * Modals
     */

    get modalStack() {
        return this._modalStack || (this._modalStack = []);
    }
    get baseModalComponent() {
        return Modals.baseComponent;
    }
    addModal(_modal, component) {
        const modal = Modals.add(_modal, component);
        modal.on('close', () => {
            let index;
            while ((index = this.modalStack.findIndex(m => m === modal)) > -1)
                this.modalStack.splice(index, 1);
        });
        this.modalStack.push(modal);
        return modal;
    }
    closeModal(modal, force) {
        return Modals.close(modal, force);
    }
    closeAllModals(force) {
        const promises = [];
        for (let modal of this.modalStack)
            promises.push(modal.close(force));
        return Promise.all(promises);
    }
    closeLastModal(force) {
        if (!this.modalStack.length) return;
        return this.modalStack[this.modalStack.length - 1].close(force);
    }
    basicModal(title, text) {
        return this.addModal(Modals.basic(title, text));
    }
    settingsModal(settingsset, headertext, options) {
        return this.addModal(Modals.settings(settingsset, headertext, options));
    }
    get Modals() {
        return Object.defineProperties({
            add: this.addModal.bind(this),
            close: this.closeModal.bind(this),
            closeAll: this.closeAllModals.bind(this),
            closeLast: this.closeLastModal.bind(this),
            basic: this.basicModal.bind(this),
            settings: this.settingsModal.bind(this)
        }, {
            stack: {
                get: () => this.modalStack
            },
            baseComponent: {
                get: () => this.baseModalComponent
            }
        });
    }

    /**
     * Plugins
     */

    async getPlugin(plugin_id) {
        // This should require extra permissions
        return await PluginManager.waitForPlugin(plugin_id);
    }
    listPlugins() {
        return PluginManager.localContent.map(plugin => plugin.id);
    }
    get Plugins() {
        return {
            getPlugin: this.getPlugin.bind(this),
            listPlugins: this.listPlugins.bind(this)
        };
    }

    /**
     * Themes
     */

    async getTheme(theme_id) {
        // This should require extra permissions
        return await ThemeManager.waitForContent(theme_id);
    }
    listThemes() {
        return ThemeManager.localContent.map(theme => theme.id);
    }
    get Themes() {
        return {
            getTheme: this.getTheme.bind(this),
            listThemes: this.listThemes.bind(this)
        };
    }

    /**
     * ExtModules
     */

    async getModule(module_id) {
        // This should require extra permissions
        return await ExtModuleManager.waitForContent(module_id);
    }
    listModules() {
        return ExtModuleManager.localContent.map(module => module.id);
    }
    get ExtModules() {
        return {
            getModule: this.getModule.bind(this),
            listModules: this.listModules.bind(this)
        };
    }

    /**
     * WebpackModules
     */

    get webpackRequire() {
        return WebpackModules.require;
    }
    getWebpackModule(filter, first = true) {
        return WebpackModules.getModule(filter, first);
    }
    getWebpackModuleByName(name, fallback) {
        return WebpackModules.getModuleByName(name, fallback);
    }
    getWebpackModuleByRegex(regex, first = true) {
        return WebpackModules.getModuleByRegex(regex, first);
    }
    getWebpackModuleByProperties(props, first = true) {
        return WebpackModules.getModuleByProps(props, first);
    }
    getWebpackModuleByPrototypeFields(props, first = true) {
        return WebpackModules.getModuleByPrototypes(props, first);
    }
    get WebpackModules() {
        return Object.defineProperty({
            getModule: this.getWebpackModule.bind(this),
            getModuleByName: this.getWebpackModuleByName.bind(this),
            getModuleByDisplayName: this.getWebpackModuleByName.bind(this),
            getModuleByRegex: this.getWebpackModuleByRegex.bind(this),
            getModuleByProperties: this.getWebpackModuleByProperties.bind(this),
            getModuleByPrototypeFields: this.getWebpackModuleByPrototypeFields.bind(this)
        }, 'require', {
            get: () => this.webpackRequire
        });
    }

}

// Stop plugins from modifying the plugin API for all plugins
// Plugins can still modify their own plugin API object
Object.freeze(PluginApi);
Object.freeze(PluginApi.prototype);
