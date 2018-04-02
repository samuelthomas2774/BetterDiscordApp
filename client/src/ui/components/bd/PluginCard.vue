/**
 * BetterDiscord Plugin Card Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <Card :item="plugin">
        <SettingSwitch v-if="plugin.type === 'plugin'" slot="toggle" :value="plugin.enabled" @input="$emit('toggle-plugin')" />
        <ButtonGroup slot="controls">
            <Button v-tooltip="'Settings (shift + click to open settings without cloning the set)'" v-if="plugin.hasSettings" @click="$emit('show-settings', $event.shiftKey)"><MiSettings size="18" /></Button>
            <Button v-tooltip="'Reload'" @click="$emit('reload-plugin')"><MiRefresh size="18" /></Button>
            <Button v-tooltip="'Edit'" @click="editPlugin"><MiPencil size="18" /></Button>
            <Button v-tooltip="'Uninstall (shift + click to unload)'" @click="$emit('delete-plugin', $event.shiftKey)" type="err"><MiDelete size="18" /></Button>
        </ButtonGroup>
    </Card>
</template>

<script>
    // Imports
    import { ClientLogger as Logger } from 'common';
    import { shell } from 'electron';
    import Card from './Card.vue';
    import { Button, ButtonGroup, SettingSwitch, MiSettings, MiRefresh, MiPencil, MiDelete, MiExtension } from '../common';

    export default {
        props: ['plugin'],
        components: {
            Card, Button, ButtonGroup, SettingSwitch,
            MiSettings, MiRefresh, MiPencil, MiDelete, MiExtension
        },
        methods: {
            editPlugin() {
                try {
                    shell.openItem(this.plugin.contentPath);
                } catch (err) {
                    Logger.err('PluginCard', [`Error opening plugin directory ${this.plugin.contentPath}:`, err]);
                }
            }
        }
    }
</script>
