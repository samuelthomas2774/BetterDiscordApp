/**
 * BetterDiscord Plugin Manager
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree. 
*/

const { Module } = require('./modulebase');
const { FileUtils, Logger } = require('./utils');
const { Global } = require('./global');
const path = window.require('path');

class Plugin {

    constructor(pluginInternals) {
        this.__pluginInternals = pluginInternals;
        this.userConfig.enabled = this.userConfig.enabled || false;
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

    get configs() { return this.__pluginInternals.configs }
    get info() { return this.__pluginInternals.info }
    get paths() { return this.__pluginInternals.paths }
    get main() { return this.__pluginInternals.main }
    get defaultConfig() { return this.configs.defaultConfig }
    get userConfig() { return this.configs.userConfig }
    get name() { return this.info.name }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get pluginPath() { return this.paths.pluginPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }

    start() {
        if (this.onStart) {
            const started = this.onStart();
            if (started) {
                return this.userConfig.enabled = true;
            }
            return false;
        }
        return this.userConfig.enabled = true; //Assume plugin started since it doesn't have onStart
    }

    stop() {
        if (this.onStop) {
            const stopped = this.onStop();
            if (stopped) {
                this.userConfig.enabled = false;
                return true;
            }
            return false;
        }
        this.userConfig.enabled = false;
        return true; //Assume plugin stopped since it doesn't have onStop
    }

}

class PluginManager extends Module {
    
    setInitialState() {
        window.pm = this;
        this.setState({
            plugins: []
        });
    }

    get plugins() {
        return this.state.plugins;
    }

    get pluginsPath() {
        return Global.getObject('paths').find(path => path.id === 'plugins').path;
    }

    async loadAllPlugins() {
        try {
            const directories = await FileUtils.readDir(this.pluginsPath);

            for (let dir of directories) {
                try {
                    await this.loadPlugin(dir);
                } catch (err) {
                    //We don't want every plugin to fail loading when one does
                    Logger.err('PluginManager', err);
                }
            }

            return this.plugins;
        } catch (err) {
            throw err;
        }
    }

    async refreshPlugins() {
        if (this.plugins.length <= 0) return this.loadAllPlugins();
        try {
            const directories = await FileUtils.readDir(this.pluginsPath);
            for (let dir of directories) {
                //If a plugin is already loaded this should resolve.
                if (this.getPluginByDirName(dir)) continue;

                try {
                    //Load the plugin if not
                    await this.loadPlugin(dir);
                } catch (err) {
                    //We don't want every plugin to fail loading when one does
                    Logger.err('PluginManager', err);
                }
            }

            for (let plugin of this.plugins) {
                if (directories.includes(plugin.dirName)) continue;
                //Plugin was deleted manually, stop it and remove any reference
                try {
                    if (plugin.enabled) plugin.stop();
                    const { pluginPath } = plugin;
                    const index = this.getPluginIndex(plugin);

                    delete window.require.cache[window.require.resolve(pluginPath)];
                    this.plugins.splice(index, 1);
                } catch (err) {
                    //This might fail but we don't have any other option at this point
                    Logger.err('PluginManager', err);
                }
            }
        } catch (err) {
            throw err;
        }
    }

    async loadPlugin(pluginPath) {
        const { plugins } = this.state;
        const dirName = pluginPath;

        try {
            pluginPath = path.join(this.pluginsPath, pluginPath);

            const loaded = plugins.find(plugin => plugin.pluginPath === pluginPath);
            if (loaded) {
                throw { 'message': 'Attempted to load an already loaded plugin' };
            }

            const readConfig = await this.readConfig(pluginPath);
            const mainPath = path.join(pluginPath, readConfig.main);
            const userConfigPath = path.join(pluginPath, 'user.config.json');

            let userConfig = readConfig.defaultConfig;
            try {
                const readUserConfig = await FileUtils.readJsonFromFile(userConfigPath);
                userConfig = Object.assign({}, userConfig, readUserConfig);
            } catch (err) {/*We don't care if this fails it either means that user config doesn't exist or there's something wrong with it so we revert to default config*/}

            const configs = {
                defaultConfig: readConfig.defaultConfig,
                userConfig
            };

            const plugin = window.require(mainPath)(Plugin, {}, {});
            const instance = new plugin({configs, info: readConfig.info, main: readConfig.main, paths: { pluginPath, dirName }});

            if (instance.enabled) instance.start();

            plugins.push(instance);

            this.setState(plugins);

            return instance;
        } catch (err) {
            throw err;
        }
    }

    async reloadPlugin(plugin) {
        const _plugin = this.findPlugin(plugin);
        if (!_plugin) throw { 'message': 'Attempted to reload a plugin that is not loaded?' };
        if (!_plugin.stop()) throw { 'message': 'Plugin failed to stop!' };
        const index = this.getPluginIndex(_plugin);
        const { pluginPath, dirName } = _plugin;
        delete window.require.cache[window.require.resolve(pluginPath)];

        this.plugins.splice(index, 1);

        return this.loadPlugin(dirName);
    }

    //TODO make this nicer
    findPlugin(wild) {
        let plugin = this.getPluginByName(wild);
        if (plugin) return plugin;
        plugin = this.getPluginById(wild);
        if (plugin) return plugin;
        plugin = this.getPluginByPath(wild);
        if (plugin) return plugin;
        return this.getPluginByDirName(wild);
    }

    getPluginIndex(plugin) { return this.plugins.findIndex(p => p === plugin) }
    getPluginByName(name) { return this.plugins.find(p => p.name === name) }
    getPluginById(id) { return this.plugins.find(p => p.id === id) }
    getPluginByPath(path) { return this.plugins.find(p => p.pluginPath === path) }
    getPluginByDirName(dirName) { return this.plugins.find(p => p.dirName === dirName) }

    stopPlugin(name) {
        const plugin = this.getPluginByName(name);
        try {
            if (plugin) return plugin.stop();
        } catch (err) {
            Logger.err('PluginManager', err);
        }
        return true; //Return true anyways since plugin doesn't exist
    }

    startPlugin(name) {
        const plugin = this.getPluginByName(name);
        try {
            if (plugin) return plugin.start();
        } catch (err) {
            Logger.err('PluginManager', err);
        }
        return true; //Return true anyways since plugin doesn't exist
    }

    async readConfig(path) {
        path = `${path}/config.json`;
        return FileUtils.readJsonFromFile(path);
    }

}

const _instance = new PluginManager();

async function pluginManager(pluginName) {

    try {
        //Load test plugin
        const plugin = await _instance.loadPlugin(pluginName);
        //Attempt to load the same plugin again
        const plugin2 = await _instance.loadPlugin(pluginName);

        return true;
    } catch (err) {
        console.log(`Failed to load plugin! ${err.message}`);
    }

    try {
        //Reload test plugin
        const reloadedPlugin = await _instance.reloadPlugin('Example Plugin');
    } catch (err) {
        console.log(`Failed to reload plugin! ${err.message}`);
    }
}

if (window.bdTests) window.bdTests.pluginManager = pluginManager;
else window.bdTests = { pluginManager };

module.exports = { PluginManager: _instance }