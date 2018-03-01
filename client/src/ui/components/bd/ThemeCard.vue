/**
 * BetterDiscord Theme Card Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <Card :item="theme">
        <SettingSwitch slot="toggle" :checked="theme.enabled" :change="toggleTheme" />
        <ButtonGroup slot="controls">
            <Button v-tooltip="'Settings'" v-if="theme.hasSettings" :onClick="showSettings"><MiSettings size="18" /></Button>
            <Button v-tooltip="'Recompile (shift + click to reload)'" :onClick="reloadTheme"><MiRefresh size="18" /></Button>
            <Button v-tooltip="'Edit'" :onClick="editTheme"><MiPencil size="18" /></Button>
            <Button v-tooltip="'Uninstall (shift + click to unload)'" :onClick="deleteTheme" type="err"><MiDelete size="18" /></Button>
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
        props: ['theme', 'toggleTheme', 'reloadTheme', 'deleteTheme', 'showSettings'],
        components: {
            Card, Button, ButtonGroup, SettingSwitch, MiSettings, MiRefresh, MiPencil, MiDelete, MiExtension
        },
        methods: {
            editTheme() {
                try {
                    shell.openItem(this.theme.themePath);
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
</script>
