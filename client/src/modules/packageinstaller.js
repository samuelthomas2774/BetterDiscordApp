import EventListener from './eventlistener';
import asar from 'asar';

import { Modals } from 'ui';
import { Utils } from 'common';
import PluginManager from './pluginmanager';

export default class extends EventListener {

    get eventBindings() {
        return [
            { id: 'install-pkg', callback: this.installPackage }
        ];
    }

    async installPackage(pkg, upload) {
        try {
            const config = JSON.parse(asar.extractFile(pkg.path, 'config.json').toString());
            const { info, main } = config;

            let icon = null;
            if (info.icon && info.icon_type) {
                const extractIcon = asar.extractFile(pkg.path, info.icon);
                icon = `data:${info.icon_type};base64,${Utils.arrayBufferToBase64(extractIcon)}`;
            }
            if (icon) config.iconEncoded = icon;
            const isPlugin = info.type && info.type === 'plugin' || main.endsWith('.js');

            /*
            config.permissions = [
                {
                    HEADER: 'Test Permission Header',
                    BODY: 'Test Permission Body'
                },
                {
                    HEADER: 'Test Permission Header',
                    BODY: 'Test Permission Body'
                },
                {
                    HEADER: 'Test Permission Header',
                    BODY: 'Test Permission Body'
                },
                {
                    HEADER: 'Test Permission Header',
                    BODY: 'Test Permission Body'
                }
            ];
            */
            // Show install modal
            const modalResult = await Modals.installModal(isPlugin ? 'plugin' : 'theme', config).promise;

            if (modalResult === 0) {
                // Upload it instead
            }

            console.log(modalResult);

        } catch (err) {}
    }

}
