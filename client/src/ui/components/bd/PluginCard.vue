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
    <div class="bd-plugin-card">
        <div class="bd-plugin-header">
            <div class="bd-plugin-icon" :style="{backgroundImage: plugin.icon ? `url(${plugin.icon})` : null}">
                <MiExtension v-if="!plugin.icon" :size="30"/>
            </div>
            <span>{{plugin.name}}</span>
            <div class="bd-flex-spacer" />
            <label class="bd-switch-wrapper" @click="() => { togglePlugin(plugin); this.$forceUpdate(); }">
                <input type="checkbox" class="bd-switch-checkbox" />
                <div class="bd-switch" :class="{'bd-checked': plugin.enabled}" />
            </label>
        </div>
        <div class="bd-plugin-body">
            <div class="bd-plugin-description">{{plugin.description}}</div>
            <div class="bd-plugin-footer">
                <div class="bd-plugin-extra">v{{plugin.version}} by {{plugin.authors.join(', ').replace(/,(?!.*,)/gmi, ' and')}}</div>
                <div class="bd-controls">
                    <ButtonGroup>
                        <Button v-tooltip="'Settings'" v-if="plugin.hasSettings" :onClick="() => showSettings(plugin)">
                            <MiSettings size="18"/>
                        </Button>
                        <Button v-tooltip="'Reload'" :onClick="() => reloadPlugin(plugin)">
                            <MiRefresh size="18" />
                        </Button>
                        <Button v-tooltip="'Edit'" :onClick="editPlugin">
                            <MiPencil size="18" />
                        </Button>
                        <Button v-tooltip="'Uninstall'" type="err">
                            <MiDelete size="18" />
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    // Imports
    import { shell } from 'electron';
    import { Button, ButtonGroup, SettingSwitch, MiSettings, MiRefresh, MiPencil, MiDelete, MiExtension } from '../common';

    export default {
        data() {
            return {
                settingsOpen: false
            }
        },
        props: ['plugin', 'togglePlugin', 'reloadPlugin', 'showSettings'],
        components: {
            Button, ButtonGroup, SettingSwitch, MiSettings, MiRefresh, MiPencil, MiDelete, MiExtension
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
