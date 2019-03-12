import EventListener from './eventlistener';
import asar from 'asar';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import { request } from 'vendor';
import { Modals } from 'ui';
import { Utils, FileUtils } from 'common';
import PluginManager from './pluginmanager';
import Globals from './globals';
import Security from './security';
import Reflection from './reflection';
import DiscordApi from './discordapi';
import ThemeManager from './thememanager';
import { MonkeyPatch } from './patcher';
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

            if (oldContent.packed && oldContent.packageName !== nameOrId) {
                await FileUtils.deleteFile(oldContent.packagePath).catch(err => null);
            }
            await FileUtils.recursiveDeleteDirectory(oldContent.contentPath).catch(err => null);

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

    static async handleDrop(stateNode, e, original) {
        if (!e.dataTransfer.files.length || !e.dataTransfer.files[0].name.endsWith('.bd')) return original && original.call(stateNode, e);

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (stateNode) stateNode.clearDragging();

        const currentChannel = DiscordApi.currentChannel;
        const canUpload = currentChannel ?
            currentChannel.checkPermissions(Reflection.modules.DiscordConstants.Permissions.SEND_MESSAGES) &&
            currentChannel.checkPermissions(Reflection.modules.DiscordConstants.Permissions.ATTACH_FILES) : false;

        const files = Array.from(e.dataTransfer.files).slice(0);
        const actionCode = await this.dragAndDropHandler(e.dataTransfer.files[0].path, canUpload);

        if (actionCode === 0 && stateNode) stateNode.promptToUpload(files, currentChannel.id, true, !e.shiftKey);
    }

    /**
     * Patches Discord upload area for .bd files
     */
    static async uploadAreaPatch(UploadArea) {
        // Add a listener to root for when not in a channel
        const root = DOM.getElement('#app-mount');
        const rootHandleDrop = this.handleDrop.bind(this, undefined);
        root.addEventListener('drop', rootHandleDrop);

        const unpatchUploadAreaHandleDrop = MonkeyPatch('BD:ReactComponents', UploadArea.component.prototype).instead('handleDrop', (component, [e], original) => this.handleDrop(component, e, original));

        this.unpatchUploadArea = () => {
            unpatchUploadAreaHandleDrop();
            root.removeEventListener('drop', rootHandleDrop);
            this.unpatchUploadArea = undefined;
        };

        for (const element of document.querySelectorAll(UploadArea.important.selector)) {
            const stateNode = Reflection.DOM(element).getComponentStateNode(UploadArea);

            element.removeEventListener('drop', stateNode.handleDrop);
            stateNode.handleDrop = UploadArea.component.prototype.handleDrop.bind(stateNode);
            element.addEventListener('drop', stateNode.handleDrop);

            stateNode.forceUpdate();
        }
    }

}
