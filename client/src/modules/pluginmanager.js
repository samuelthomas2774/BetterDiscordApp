/**
 * BetterDiscord Plugin Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import ContentManager from './contentmanager';
import ExtModuleManager from './extmodulemanager';
import Plugin from './plugin';
import PluginApi from './pluginapi';
import Vendor from './vendor';
import { ClientLogger as Logger } from 'common';
import { Events, Permissions } from 'modules';
import { Modals } from 'ui';
import { ErrorEvent } from 'structs';

export default class extends ContentManager {

    static get localPlugins() {
        return this.localContent;
    }

    static get contentType() {
        return 'plugin';
    }

    static get moduleName() {
        return 'Plugin Manager';
    }

    static get pathId() {
        return 'plugins';
    }

    static async loadAllPlugins(suppressErrors) {
        this.loaded = false;
        const loadAll = await this.loadAllContent(true);
        this.loaded = true;
        for (let plugin of this.localPlugins) {
            try {
                if (plugin.enabled) plugin.start();
            } catch (err) {
                // Disable the plugin but don't save it - the next time BetterDiscord is started the plugin will attempt to start again
                plugin.userConfig.enabled = false;
                this.errors.push(new ErrorEvent({
                    module: this.moduleName,
                    message: `Failed to start ${plugin.name}`,
                    err
                }));

                Logger.err(this.moduleName, [`Failed to start plugin ${plugin.name}:`, err]);
            }
        }

        if (this.errors.length && !suppressErrors) {
            Modals.error({
                header: `${this.moduleName} - ${this.errors.length} ${this.contentType}${this.errors.length !== 1 ? 's' : ''} failed to load`,
                module: this.moduleName,
                type: 'err',
                content: this.errors
            });
            this._errors = [];
        }

        return loadAll;
    }
    static get refreshPlugins() { return this.refreshContent }

    static get loadContent() { return this.loadPlugin }
    static async loadPlugin(paths, configs, info, main, dependencies, permissions) {

        if (permissions && permissions.length > 0) {
            for (let perm of permissions) {
                console.log(`Permission: ${Permissions.permissionText(perm).HEADER} - ${Permissions.permissionText(perm).BODY}`);
            }
            try {
                const allowed = await Modals.permissions(`${info.name} wants to:`, info.name, permissions).promise;
            } catch (err) {
                return null;
            }
        }

        const deps = [];
        if (dependencies) {
            for (const [key, value] of Object.entries(dependencies)) {
                const extModule = ExtModuleManager.findModule(key);
                if (!extModule) {
                    throw {
                        'message': `Dependency: ${key}:${value} is not loaded`
                    };
                }
                deps[key] = extModule.__require;
            }
        }

        const plugin = window.require(paths.mainPath)(Plugin, new PluginApi(info), Vendor, deps);
        const instance = new plugin({
            configs, info, main,
            paths: {
                contentPath: paths.contentPath,
                dirName: paths.dirName,
                mainPath: paths.mainPath
            }
        });

        if (instance.enabled && this.loaded) instance.start();
        return instance;
    }

    static get unloadPlugin() { return this.unloadContent }
    static get reloadPlugin() { return this.reloadContent }

    static stopPlugin(name) {
        const plugin = name instanceof Plugin ? name : this.getPluginByName(name);
        try {
            if (plugin) return plugin.stop();
        } catch (err) {
           // Logger.err('PluginManager', err);
        }
        return true; //Return true anyways since plugin doesn't exist
    }

    static startPlugin(name) {
        const plugin = name instanceof Plugin ? name : this.getPluginByName(name);
        try {
            if (plugin) return plugin.start();
        } catch (err) {
           // Logger.err('PluginManager', err);
        }
        return true; //Return true anyways since plugin doesn't exist
    }

    static get isPlugin() { return this.isThisContent }
    static isThisContent(plugin) {
        return plugin instanceof Plugin;
    }

    static get findPlugin() { return this.findContent }
    static get getPluginIndex() { return this.getContentIndex }
    static get getPluginByName() { return this.getContentByName }
    static get getPluginById() { return this.getContentById }
    static get getPluginByPath() { return this.getContentByPath }
    static get getPluginByDirName() { return this.getContentByDirName }

    static get waitForPlugin() { return this.waitForContent }

}
