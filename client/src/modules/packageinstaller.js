import EventListener from './eventlistener';
import asar from 'asar';
import fs from 'fs';
import path from 'path';

import { Modals } from 'ui';
import { Utils } from 'common';
import PluginManager from './pluginmanager';
import Globals from './globals';
import Security from './security';

export default class {

    static async installPackageDragAndDrop(pkg, upload) {
        try {
            const config = JSON.parse(asar.extractFile(pkg.path, 'config.json').toString());
            const { info, main } = config;

            let icon = null;
            if (info.icon && info.icon_type) {
                const extractIcon = asar.extractFile(pkg.path, info.icon);
                icon = `data:${info.icon_type};base64,${Utils.arrayBufferToBase64(extractIcon)}`;
            }

            const isPlugin = info.type && info.type === 'plugin' || main.endsWith('.js');

            // Show install modal
            const modalResult = await Modals.installModal(isPlugin ? 'plugin' : 'theme', config, pkg.path, icon).promise;

            if (modalResult === 0) {
                // Upload it instead
            }

        } catch (err) {}
    }

    /**
     * Hash and verify a package
     * @param {Byte[]|String} bytesOrPath byte array of binary or path to local file
     * @param {String} id Package id
     */
    static async verifyPackage(bytesOrPath, id) {
        const bytes = typeof bytesOrPath === 'string' ? fs.readFileSync(bytesOrPath) : bytesOrPath;
        // Temporary hash to simulate response from server
        const tempVerified = ['2e3532ee366816adc37b0f478bfef35e03f96e7aeee9b115f5918ef6a4e94de8', '06a2eb4e37b926354ab80cd83207db67e544c932e9beddce545967a21f8db5aa'];
        const hashBytes = Security.hash('sha256', bytes, 'hex');

        return tempVerified.includes(hashBytes);
    }

    // TODO lots of stuff
    /**
     * Installs or updates defined package
     * @param {Byte[]|String} bytesOrPath byte array of binary or path to local file
     * @param {String} name Package name
     * @param {Boolean} update Does an older version already exist
     */
    static async installPackage(bytesOrPath, id, update = false) {
        const bytes = typeof bytesOrPath === 'string' ? fs.readFileSync(bytesOrPath) : bytesOrPath;

        const outputName = `${id}.bd`;
        const outputPath = path.join(Globals.getPath('plugins'), outputName);
        fs.writeFileSync(outputPath, bytes);

        if (!update) {
            return PluginManager.preloadPackedContent(outputName);
        }

        return PluginManager.reloadContent(PluginManager.getPluginById(id));
    }

}
