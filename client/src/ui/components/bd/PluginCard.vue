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
        <SettingSwitch v-if="plugin.type === 'plugin'" slot="toggle" :checked="plugin.enabled" :change="togglePlugin" />
        <ButtonGroup slot="controls">
            <Button v-tooltip="'Settings'" v-if="plugin.hasSettings" :onClick="() => showSettings(plugin)"><MiSettings size="18" /></Button>
            <Button v-tooltip="'Reload'" :onClick="reloadPlugin"><MiRefresh size="18" /></Button>
            <Button v-tooltip="'Edit'" :onClick="editPlugin"><MiPencil size="18" /></Button>
            <Button v-tooltip="'Uninstall (shift + click to unload)'" :onClick="deletePlugin" type="err"><MiDelete size="18" /></Button>
        </ButtonGroup>
    </Card>
</template>
<script>
    // Imports
    import { shell } from 'electron';
    import Card from './Card.vue';
    import { Button, ButtonGroup, SettingSwitch, MiSettings, MiRefresh, MiPencil, MiDelete, MiExtension } from '../common';

    export default {
        data() {
            return {
                settingsOpen: false
            }
        },
        props: ['plugin', 'togglePlugin', 'reloadPlugin', 'deletePlugin', 'showSettings'],
        components: {
            Card, Button, ButtonGroup, SettingSwitch, MiSettings, MiRefresh, MiPencil, MiDelete, MiExtension
        },
        methods: {
            editPlugin() {
                try {
                    shell.openItem(this.plugin.pluginPath);
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
</script>
