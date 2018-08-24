/* Deprecation Notice */
import { WebpackModules } from './reflection/wpm.depr.js';
import { ClientLogger as Logger } from 'common';

const DeprecationWarning = new Proxy(WebpackModules, {
    get(WebpackModules, property) {
        Logger.warn('DEPR', 'WebpackModules is deprecated. Use Reflection.Modules instead.');
        return WebpackModules[property] || WebpackModules.getModuleByName(property);
    }
});

export { DeprecationWarning as WebpackModules };
