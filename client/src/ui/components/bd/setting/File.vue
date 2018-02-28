/**
 * BetterDiscord Setting File Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-fileinput">
        <div class="bd-title">
            <h3>{{ setting.text }}</h3>
            <button class="bd-button bd-button-primary" :class="{'bd-disabled': setting.disabled}" @click="openDialog">Select</button>
        </div>
        <div class="bd-hint">{{ setting.hint }}</div>
        <div class="bd-selected-files">
            <div class="bd-selected-file" v-for="file_path in this.setting.value">
                <!-- Maybe add a preview here later? -->
                <!-- For now just show the selected file path -->
                <span class="bd-file-path">{{ file_path }}</span>
                <span class="bd-file-open" @click="() => openItem(file_path)"><MiOpenInNew /></span>
                <span class="bd-file-remove" @click="() => removeItem(file_path)"><MiMinus /></span>
            </div>
        </div>
    </div>
</template>

<script>
    import { shell } from 'electron';
    import { ClientIPC } from 'common';
    import { MiOpenInNew, MiMinus } from '../../common';
    import path from 'path';

    export default {
        props: ['setting', 'change'],
        components: {
            MiOpenInNew, MiMinus
        },
        methods: {
            async openDialog(e) {
                if (this.setting.disabled) return;

                const filenames = await ClientIPC.send('bd-native-open', this.setting.dialogOptions);
                if (filenames)
                    this.change(filenames);
            },
            openItem(file_path) {
                shell.openItem(path.resolve(this.setting.path, file_path));
            },
            removeItem(file_path) {
                this.change(this.setting.value.filter(f => f !== file_path));
            }
        }
    }
</script>
