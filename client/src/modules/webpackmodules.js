/* Deprecation Notice */
import { Modules } from './reflection/modules';
import { ClientLogger as Logger } from 'common';

const DeprecationWarning = new Proxy(Modules, {
    get(Modules, property) {
        Logger.warn('DEPR', 'WebpackModules is deprecated. Use Reflection.Modules instead.');
        return Modules[property] || Modules.getModuleByName(property);
    }
});

export { DeprecationWarning as WebpackModules };
