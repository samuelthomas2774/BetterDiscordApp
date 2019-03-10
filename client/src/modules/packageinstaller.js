import EventListener from './eventlistener';
import asar from 'asar';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import { request } from 'vendor';
import { Modals } from 'ui';
import { Utils } from 'common';
import PluginManager from './pluginmanager';
import Globals from './globals';
import Security from './security';
import Reflection from './reflection';
import DiscordApi from './discordapi';
import ThemeManager from './thememanager';
import { DOM } from 'ui';

export default class PackageInstaller {

    /**
     * Handler for drag and drop package install
     * @param {String} filePath Path to local file
     * @param {Boolean} canUpload If the user can upload files in current window
     * @returns {Number} returns action code from modal
     */
    static async dragAndDropHandler(filePath, canUpload) {
        try {
            const config = JSON.parse(asar.extractFile(filePath, 'config.json').toString());
            const { info, main } = config;

            let icon = null;
            if (info.icon && info.icon_type) {
                const extractIcon = asar.extractFile(filePath, info.icon);
                icon = `data:${info.icon_type};base64,${Utils.arrayBufferToBase64(extractIcon)}`;
            }

            const isPlugin = info.type && info.type === 'plugin' || main.endsWith('.js');

            // Show install modal
            const modalResult = await Modals.installModal(isPlugin ? 'plugin' : 'theme', config, filePath, icon, canUpload).promise;
            return modalResult;
        } catch (err) {
            console.log(err);
        }
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
     * @param {String} nameOrId Package name
     * @param {Boolean} update Does an older version already exist
     */
    static async installPackage(bytesOrPath, nameOrId, contentType, update = false) {
        let outputPath = null;
        try {

            const bytes = typeof bytesOrPath === 'string' ? fs.readFileSync(bytesOrPath) : bytesOrPath;
            const outputName = `${nameOrId}.bd`;

            outputPath = path.join(Globals.getPath(`${contentType}s`), outputName);
            fs.writeFileSync(outputPath, bytes);

            const manager = contentType === 'plugin' ? PluginManager : ThemeManager;

            if (!update) return manager.preloadPackedContent(outputName);

            const oldContent = manager.findContent(nameOrId);

            await oldContent.unload(true);

            if (oldContent.packed && oldContent.packed.packageName !== nameOrId) {
                rimraf(oldContent.packed.packagePath, err => {
                    if (err) throw err;
                });
            } else {
                rimraf(oldContent.contentPath, err => {
                    if (err) throw err;
                });
            }

            return manager.preloadPackedContent(outputName);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Install package from remote location. Only github/bdapi is supported.
     * @param {String} remoteLocation Remote resource location
     */
    static async installRemotePackage(remoteLocation) {
        try {
            const { hostname } = Object.assign(document.createElement('a'), { href: remoteLocation });
            if (hostname !== 'api.github.com' && hostname !== 'secretbdapi') throw 'Invalid host!';

            const options = {
                uri: remoteLocation,
                encoding: null,
                headers: {
                    'User-Agent': 'BetterDiscordClient',
                    'Accept': 'application/octet-stream'
                }
            };

            const response = await request.get(options);
            const outputPath = path.join(Globals.getPath('tmp'), Security.hash('sha256', response, 'hex'));
            fs.writeFileSync(outputPath, response);
            console.log('response', response);
            console.log('output', outputPath);

            await this.dragAndDropHandler(outputPath);
            rimraf(outputPath, err => {
                if (err) console.log(err);
            });
        } catch (err) {
            throw err;
        }
    }

    /**
     * Patches Discord upload area for .bd files
     */
    static async uploadAreaPatch(UploadArea) {
        const reflect = Reflection.DOM(UploadArea.important.selector);
        const stateNode = reflect.getComponentStateNode(UploadArea);

        const callback = async function (e) {
            if (!e.dataTransfer.files.length || !e.dataTransfer.files[0].name.endsWith('.bd')) return;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            stateNode.clearDragging();
            const currentChannel = DiscordApi.currentChannel;
            const canUpload = currentChannel ? currentChannel.checkPermissions(Reflection.modules.DiscordConstants.Permissions.ATTACH_FILES) : false;
            const files = Array.from(e.dataTransfer.files).slice(0);
            const actionCode = await PackageInstaller.dragAndDropHandler(e.dataTransfer.files[0].path, canUpload);
            if (actionCode === 0) stateNode.promptToUpload(files, currentChannel.id, true, !e.shiftKey);
        };

        // Add a listener to root for when not in a channel
        const root = DOM.getElement('#app-mount');
        root.addEventListener('drop', callback);

        // Remove their handler, add ours, then read theirs to give ours priority to stop theirs when we get a .bd file.
        reflect.element.removeEventListener('drop', stateNode.handleDrop);
        reflect.element.addEventListener('drop', callback);
        reflect.element.addEventListener('drop', stateNode.handleDrop);

        this.unpatchUploadArea = function () {
            reflect.element.removeEventListener('drop', callback);
            root.removeEventListener('drop', callback);
        };
    }

}
