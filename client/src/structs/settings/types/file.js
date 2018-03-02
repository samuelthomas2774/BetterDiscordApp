/**
 * BetterDiscord File Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeManager } from 'modules';
import { FileUtils, ClientIPC } from 'common';
import Setting from './basesetting';
import path from 'path';

export default class FileSetting extends Setting {

    get defaultValue() {
        return [];
    }

    get dialogOptions() {
        return this.args.dialogOptions || {};
    }

    async openDialog() {
        if (this.disabled) return;

        const filenames = await ClientIPC.send('bd-native-open', this.dialogOptions);
        if (filenames)
            this.value = filenames;
    }

    async toSCSS() {
        if (!this.value || !this.value.length) return '()';

        const files = [];
        for (let filepath of this.value) {
            const buffer = await FileUtils.readFileBuffer(path.resolve(this.path, filepath));
            const type = await FileUtils.getFileType(buffer);
            files.push(`(data: ${ThemeManager.toSCSSString(buffer.toString('base64'))}, type: ${ThemeManager.toSCSSString(type.mime)}, url: ${ThemeManager.toSCSSString(await FileUtils.toDataURI(buffer, type.mime))})`);
        }

        return files.length ? files.join(', ') : '()';
    }

}
