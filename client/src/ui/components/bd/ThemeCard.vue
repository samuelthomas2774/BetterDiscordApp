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
    <div class="bd-theme-card">
        <div class="bd-theme-header">
            <div class="bd-theme-icon" :style="{backgroundImage: theme.icon ? `url(${theme.icon})` : null}">
                <MiExtension v-if="!theme.icon" :size="30" />
            </div>
            <span>{{theme.name}}</span>
            <div class="bd-flex-spacer" />
            <label class="bd-switch-wrapper" @click="() => { toggleTheme(theme); this.$forceUpdate(); }">
                <input type="checkbox" class="bd-switch-checkbox" />
                <div class="bd-switch" :class="{'bd-checked': theme.enabled}" />
            </label>
        </div>
        <div class="bd-theme-body">
            <div class="bd-theme-description">{{theme.description}}</div>
            <div class="bd-theme-footer">
                <div class="bd-theme-extra">v{{theme.version}} by {{theme.authors.join(', ').replace(/,(?!.*,)/gmi, ' and')}}</div>
                <div class="bd-controls">
                    <ButtonGroup>
                        <Button v-tooltip="'Settings'" v-if="theme.hasSettings" :onClick="() => showSettings(theme)">
                            <MiSettings size="18" />
                        </Button>
                        <Button v-tooltip="'Reload'" :onClick="() => reloadTheme(theme)">
                            <MiRefresh size="18" />
                        </Button>
                        <Button v-tooltip="'Edit'" :onClick="editTheme">
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
        props: ['theme', 'toggleTheme', 'reloadTheme', 'showSettings'],
        components: {
            Button, ButtonGroup, SettingSwitch, MiSettings, MiRefresh, MiPencil, MiDelete, MiExtension
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
