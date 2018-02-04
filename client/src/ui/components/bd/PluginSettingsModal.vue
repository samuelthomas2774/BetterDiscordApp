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
    <div class="bd-plugin-settings-modal">
        <div class="bd-backdrop" @click="attemptToClose" :class="{'bd-backdrop-out': closing}"></div>
        <Modal :headerText="plugin.name + ' Settings'" :close="attemptToClose" :class="{'bd-modal-out': closing}">
            <div slot="body" class="bd-plugin-settings-body">
                <template v-for="category in configCache">
                    <div v-if="category.category === 'default' || !category.type">
                        <PluginSetting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="settingChange" />
                    </div>
                    <div v-else-if="category.type === 'static'">
                        <div class="bd-form-header">
                            <span class="bd-form-header-text">{{category.category}} static with header</span>
                        </div>
                        <PluginSetting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="settingChange" />
                    </div>
                    <Drawer v-else-if="category.type === 'drawer'" :label="category.category + ' drawer'">
                        <PluginSetting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="settingChange" />
                    </Drawer>
                    <div v-else>
                        <PluginSetting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="settingChange" />
                    </div>
                </template>

            </div>
            <div slot="footer" class="bd-footer-alert" :class ="{'bd-active': changed, 'bd-warn': warnclose}">
                <div class="bd-footer-alert-text">Unsaved changes</div>
                <div class="bd-button bd-reset-button bd-tp" :class="{'bd-disabled': saving}" @click="resetSettings">Reset</div>
                <div class="bd-button bd-ok" :class="{'bd-disabled': saving}" @click="saveSettings">
                    <div v-if="saving" class="bd-spinner-7"></div>
                    <template v-else>
                        Save Changes
                    </template>
                </div>
            </div>
        </Modal>
    </div>
</template>
<script>
    // Imports
    import { Modal } from '../common';
    import PluginSetting from './pluginsetting/PluginSetting.vue';
    import Drawer from '../common/Drawer.vue';

    export default {
        props: ['plugin','close'],
        data() {
            return {
                changed: false,
                warnclose: false,
                configCache: [],
                closing: false,
                saving: false
            }
        },
        components: {
            Modal,
            PluginSetting,
            Drawer
        },
        methods: {
            checkForChanges() {
                for (let category of this.configCache) {
                    const cat = this.plugin.pluginConfig.find(c => c.category === category.category);
                    for (let setting of category.settings) {
                        if (cat.settings.find(s => s.id === setting.id).value !== setting.value) return true;
                    }
                }
                return false;
            },
            settingChange(settingId, newValue) {
                for (let category of this.configCache) {
                    const found = category.settings.find(s => s.id === settingId);
                    if (found) {
                        found.value = newValue;
                        break;
                    }
                }
                this.changed = this.checkForChanges();
            },
            async saveSettings() {
                if (this.saving) return;
                this.saving = true;
                try {
                    await this.plugin.saveSettings(this.configCache);
                    this.configCache = JSON.parse(JSON.stringify(this.plugin.pluginConfig));
                    this.changed = false;
                } catch (err) {
                    // TODO Display error that settings failed to save
                    console.log(err);
                }
                this.saving = false;
            },
            resetSettings() {
                if (this.saving) return;
                this.configCache = JSON.parse(JSON.stringify(this.plugin.pluginConfig));
                this.changed = false;
            },
            attemptToClose(e) {
                if (!this.changed) {
                    this.closing = true;
                    setTimeout(() => {
                        this.close();
                    }, 200);
                    return;
                }
                this.warnclose = true;
                setTimeout(() => {
                    this.warnclose = false;
                }, 400);
            }
        },
        beforeMount() {
            this.configCache = JSON.parse(JSON.stringify(this.plugin.pluginConfig));
            console.log(this.configCache);
            this.changed = this.checkForChanges();
        }
    }
</script>
