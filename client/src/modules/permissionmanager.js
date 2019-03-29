/**
 * BetterDiscord Permission Manager
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Globals from './globals';
import PluginManager from './pluginmanager';
import path from 'path';

const Module = Globals.require('module');

const PermissionMap = {
    IDENTIFY: {
        HEADER: 'Access your account information',
        BODY: 'Allows :NAME: to read your account information (excluding user token).'
    },
    READ_MESSAGES: {
        HEADER: 'Read all messages',
        BODY: 'Allows :NAME: to read all messages accessible through your Discord account.'
    },
    SEND_MESSAGES: {
        HEADER: 'Send messages',
        BODY: 'Allows :NAME: to send messages on your behalf.'
    },
    DELETE_MESSAGES: {
        HEADER: 'Delete messages',
        BODY: 'Allows :NAME: to delete messages on your behalf.'
    },
    EDIT_MESSAGES: {
        HEADER: 'Edit messages',
        BODY: 'Allows :NAME: to edit messages on your behalf.'
    },
    JOIN_SERVERS: {
        HEADER: 'Join servers for you',
        BODY: 'Allows :NAME: to join servers on your behalf.'
    }
}

// Builtin modules that plugins will always be allowed to use
const harmless_modules = [
    'assert',
    'buffer', // npm packages expect this to be global - how do we deal with that?
    'console',
    'constants', // Deprecated, should this be available?
    'crypto',
    'events',
    'os',
    'path',
    // 'process', // npm packages expect this to be global - how do we deal with that?
    // 'punycode', // Deprecated, plugins should use https://www.npmjs.com/package/punycode instead
    'querystring',
    'readline', // Mostly used for command line tools but still available anyway
    'repl', // Mostly used for command line tools but still available anyway
    'stream',
    'string_decoder',
    'sys', // Deprecated, use util instead
    'timers',
    // 'tty', // There should never be a TTY in the renderer process
    'url',
    'util',
    // 'vm', // Does this allow plugins to escape the sandboxed require?
    'zlib',
    'ELECTRON_ASAR' // Internal Electron module used to create the fs module with asar support
];

export default class {

    static permissionText(permission) {
        return PermissionMap[permission];
    }

    /**
     * Checks if a plugin should be allowed to import/require a module.
     * @param {string} request Module name passed to require
     * @param {string} filename Full path to the module
     * @param {?Plugin} plugin The plugin, if available
     * @param {string} plugin_id The plugin's ID
     * @param {string} contentPath The plugin's path
     * @param {Module} parent The module that required this module
     * @return {boolean}
     */
    static canRequireModule(request, filename, plugin, plugin_id, contentPath, parent) {
        if (Module.builtinModules.includes(request)) {
            // Builtin module
            return this.canRequireNativeModule(request, plugin, plugin_id, contentPath, parent);
        }

        const extension = path.extname(filename);

        if (contentPath === filename && filename.startsWith(contentPath + path.sep)) {
            if (extension === '.node') {
                // Native plugin module
                return true;
            }

            // Plugin module
            return true;
        }

        if (extension === '.node') {
            // Native module
            return false;
        }

        const otherPluginContentPath = PluginManager.getPluginPathByPath(filename);
        if (otherPluginContentPath) {
            // Module from another plugin
            return false;
        }

        return false;
    }

    static canRequireNativeModule(request, plugin, plugin_id, contentPath, parent) {
        if (harmless_modules.includes(request)) return true;

        // Test
        if (request === 'v8') return false;

        return true;
    }

    static assertCanRequireModule(request, filename, plugin, plugin_id, contentPath, parent) {
        if (!this.canRequireModule(request, filename, plugin, plugin_id, contentPath, parent)) {
            throw new Error(`Plugin "${plugin_id}" is not allowed to use the module "${request}".`);
        }
    }

}
