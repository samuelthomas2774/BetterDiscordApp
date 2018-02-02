/**
 * BetterDiscord Plugin Settings Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <Modal :headerText="plugin.name + ' Settings'" :close="() => {  }">
        <div slot="body" class="bd-plugin-settings-body">
            <PluginSetting v-for="setting in configCache" :key="setting.id" :setting="setting" :change="settingChange"/>
        </div>
        <div slot="footer" class="bd-footer-alert" :class ="{'bd-active': changed}">
            <div class="bd-footer-alert-text">Unsaved changes</div>
            <div class="bd-button bd-reset-button bd-tp" @click="resetSettings">Reset</div>
            <div class="bd-button bd-ok" @click="saveSettings">Save Changes</div>
        </div>
    </Modal>
</template>
<script>
    // Imports
    import { Modal } from '../common';
    import PluginSetting from './pluginsetting/PluginSetting.vue';

    export default {
        props: ['plugin'],
        data() {
            return {
                changed: false,
                configCache: []
            }
        },
        components: {
            Modal,
            PluginSetting
        },
        methods: {
            checkForChanges() {
                for (let cachedSetting of this.configCache) {
                    if (this.plugin.pluginConfig.find(s => s.id === cachedSetting.id && s.value !== cachedSetting.value)) {
                        return true;
                    }
                }
                return false;
            },
            textInputKd(settingId) {
            },
            settingChange(settingId, newValue) {
                this.configCache.find(s => s.id === settingId).value = newValue;
                this.changed = this.checkForChanges();
            },
            saveSettings() {
                this.plugin.saveSettings(this.configCache);
                this.configCache = JSON.parse(JSON.stringify(this.plugin.pluginConfig));
                this.changed = false;
            },
            resetSettings() {
                this.configCache = JSON.parse(JSON.stringify(this.plugin.pluginConfig));
                this.changed = false;
            }
        },
        beforeMount() {
            this.configCache = JSON.parse(JSON.stringify(this.plugin.pluginConfig));
            this.changed = this.checkForChanges();
        }
    }
</script>