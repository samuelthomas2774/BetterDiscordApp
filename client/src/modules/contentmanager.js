/**
 * BetterDiscord Content Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Globals from './globals';
import { Utils, FileUtils, ClientLogger as Logger } from 'common';
import path from 'path';
import { Events } from 'modules';
import { SettingsSet, ErrorEvent } from 'structs';
import { Modals } from 'ui';

/**
 * Base class for external content managing
 */
export default class {

    /**
     * Any errors that happened
     * returns {Array}
     */
    static get errors() {
        return this._errors || (this._errors = []);
    }

    /**
     * Locallly stored content
     * returns {Array}
     */
    static get localContent() {
        return this._localContent ? this._localContent : (this._localContent = []);
    }

    /**
     * Local path for content
     * returns {String}
     */
    static get contentPath() {
        return this._contentPath ? this._contentPath : (this._contentPath = Globals.getObject('paths').find(path => path.id === this.pathId).path);
    }

    /**
     * Load all locally stored content
     * @param {bool} suppressErrors Suppress any errors that occur during loading of content
     */
    static async loadAllContent(suppressErrors = false) {
        try {
            await FileUtils.ensureDirectory(this.contentPath);
            const directories = await FileUtils.listDirectory(this.contentPath);

            for (let dir of directories) {
                try {
                    await FileUtils.directoryExists(path.join(this.contentPath, dir));
                } catch (err) { continue; }

                try {
                    await this.preloadContent(dir);
                } catch (err) {
                    this.errors.push(new ErrorEvent({
                        module: this.moduleName,
                        message: `Failed to load ${dir}`,
                        err
                    }));

                    Logger.err(this.moduleName, err);
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

            return this.localContent;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Refresh locally stored content
     * @param {bool} suppressErrors Suppress any errors that occur during loading of content
     */
    static async refreshContent(suppressErrors = false) {
        if (!this.localContent.length) return this.loadAllContent();

        try {
            await FileUtils.ensureDirectory(this.contentPath);
            const directories = await FileUtils.listDirectory(this.contentPath);

            for (let dir of directories) {
                // If content is already loaded this should resolve.
                if (this.getContentByDirName(dir)) continue;

                try {
                    await FileUtils.directoryExists(path.join(this.contentPath, dir));
                } catch (err) { continue; }

                try {
                    // Load if not
                    await this.preloadContent(dir);
                } catch (err) {
                    // We don't want every plugin/theme to fail loading when one does
                    this.errors.push(new ErrorEvent({
                        module: this.moduleName,
                        message: `Failed to load ${dir}`,
                        err
                    }));

                    Logger.err(this.moduleName, err);
                }
            }

            for (let content of this.localContent) {
                if (directories.includes(content.dirName)) continue;

                try {
                    // Plugin/theme was deleted manually, stop it and remove any reference
                    await this.unloadContent(content);
                } catch (err) {
                    this.errors.push(new ErrorEvent({
                        module: this.moduleName,
                        message: `Failed to unload ${content.dirName}`,
                        err
                    }));

                    Logger.err(this.moduleName, err);
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

            return this.localContent;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Common loading procedure for loading content before passing it to the actual loader
     * @param {any} dirName Base directory for content
     * @param {any} reload Is content being reloaded
     * @param {any} index Index of content in {localContent}
     */
    static async preloadContent(dirName, reload = false, index) {
        try {
            const contentPath = path.join(this.contentPath, dirName);

            await FileUtils.directoryExists(contentPath);

            if (!reload) {
                const loaded = this.localContent.find(content => content.contentPath === contentPath);
                if (loaded) {
                    throw { 'message': `Attempted to load already loaded user content: ${path}` };
                }
            }

            const readConfig = await this.readConfig(contentPath);
            const mainPath = path.join(contentPath, readConfig.main);

            const defaultConfig = new SettingsSet({
                settings: readConfig.defaultConfig,
                schemes: readConfig.configSchemes
            });

            const userConfig = {
                enabled: false,
                config: undefined,
                data: {}
            };

            try {
                const readUserConfig = await this.readUserConfig(contentPath);
                userConfig.enabled = readUserConfig.enabled || false;
                // await userConfig.config.merge({ settings: readUserConfig.config });
                // userConfig.config.setSaved();
                // userConfig.config = userConfig.config.clone({ settings: readUserConfig.config });
                userConfig.config = readUserConfig.config;
                userConfig.data = readUserConfig.data || {};
            } catch (err) { /*We don't care if this fails it either means that user config doesn't exist or there's something wrong with it so we revert to default config*/
                Logger.info(this.moduleName, `Failed reading config for ${this.contentType} ${readConfig.info.name} in ${dirName}`);
                Logger.err(this.moduleName, err);
            }

            userConfig.config = defaultConfig.clone({ settings: userConfig.config });
            userConfig.config.setSaved();

            for (let setting of userConfig.config.findSettings(() => true)) {
                setting.setContentPath(contentPath);
            }

            Utils.deepfreeze(defaultConfig);

            const configs = {
                defaultConfig,
                schemes: userConfig.schemes,
                userConfig
            };

            const paths = {
                contentPath,
                dirName,
                mainPath
            };

            const content = await this.loadContent(paths, configs, readConfig.info, readConfig.main, readConfig.dependencies, readConfig.permissions);
            if (!content) return undefined;
            if (!reload && this.getContentById(content.id))
                throw {message: `A ${this.contentType} with the ID ${content.id} already exists.`};

            if (reload) this.localContent[index] = content;
            else this.localContent.push(content);
            return content;

        } catch (err) {
            throw err;
        }
    }

    /**
     * Unload content
     * @param {any} content Content to unload
     * @param {bool} reload Whether to reload the content after
     */
    static async unloadContent(content, reload) {
        content = this.findContent(content);
        if (!content) throw {message: `Could not find a ${this.contentType} from ${content}.`};

        try {
            if (content.enabled && content.disable) content.disable(false);
            if (content.enabled && content.stop) content.stop(false);
            if (content.onunload) content.onunload(reload);
            if (content.onUnload) content.onUnload(reload);
            const index = this.getContentIndex(content);

            delete window.require.cache[window.require.resolve(content.paths.mainPath)];

            if (reload) {
                const newcontent = await this.preloadContent(content.dirName, true, index);
                if (newcontent.enabled && newcontent.start) newcontent.start(false);
                return newcontent;
            } else this.localContent.splice(index, 1);
        } catch (err) {
            Logger.err(this.moduleName, err);
            throw err;
        }
    }

    /**
     * Reload content
     * @param {any} content Content to reload
     */
    static async reloadContent(content) {
        return this.unloadContent(content, true);
    }

    /**
     * Read content config file
     * @param {any} configPath Config file path
     */
    static async readConfig(configPath) {
        configPath = path.resolve(configPath, 'config.json');
        return FileUtils.readJsonFromFile(configPath);
    }

    /**
     * Read content user config file
     * @param {any} configPath User config file path
     */
    static async readUserConfig(configPath) {
        configPath = path.resolve(configPath, 'user.config.json');
        return FileUtils.readJsonFromFile(configPath);
    }

    /**
     * Checks if the passed object is an instance of this content type.
     * @param {any} content Object to check
     */
    static isThisContent(content) {
        return false;
    }

    /**
     * Wildcard content finder
     * @param {any} wild Content name | id | path | dirname
     * @param {bool} nonunique Allow searching attributes that may not be unique
     */
    static findContent(wild, nonunique) {
        if (this.isThisContent(wild)) return wild;
        let content;
        content = this.getContentById(wild); if (content) return content;
        content = this.getContentByDirName(wild); if (content) return content;
        content = this.getContentByPath(wild); if (content) return content;
        content = this.getContentByName(wild); if (content && nonunique) return content;
    }

    static getContentIndex(content) { return this.localContent.findIndex(c => c === content) }
    static getContentByName(name) { return this.localContent.find(c => c.name === name) }
    static getContentById(id) { return this.localContent.find(c => c.id === id) }
    static getContentByPath(path) { return this.localContent.find(c => c.contentPath === path) }
    static getContentByDirName(dirName) { return this.localContent.find(c => c.dirName === dirName) }

    /**
     * Wait for content to load
     * @param {any} content_id
     */
    static waitForContent(content_id) {
        return new Promise((resolve, reject) => {
            const check = () => {
                const content = this.getContentById(content_id);
                if (content) return resolve(content);

                setTimeout(check, 100);
            };
            check();
        });
    }

}
