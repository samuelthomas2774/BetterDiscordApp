/**
 * BetterDiscord Settings Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-settings-modal" :class="{'bd-edited': changed}">
        <Modal :headerText="modal.headertext" :close="modal.close" :class="{'bd-modal-out': modal.closing}">
            <SettingsPanel :settings="settings" :schemes="modal.schemes" slot="body" class="bd-settings-modal-body" />
            <div slot="footer" class="bd-footer-alert" :class="{'bd-active': changed || saving, 'bd-warn': warnclose}" :style="{pointerEvents: changed ? 'all' : 'none'}">
                <div class="bd-footer-alert-text">Unsaved changes</div>
                <div class="bd-button bd-reset-button bd-tp" :class="{'bd-disabled': saving}" @click="resetSettings">Reset</div>
                <div class="bd-button bd-ok" :class="{'bd-disabled': saving}" @click="saveSettings">
                    <div v-if="saving" class="bd-spinner-7"></div>
                    <template v-else>Save Changes</template>
                </div>
            </div>
        </Modal>
    </div>
</template>
<script>
    // Imports
    import Vue from 'vue';
    import { Modal } from '../../common';
    import SettingsPanel from '../SettingsPanel.vue';
    import { Utils, ClientLogger as Logger } from 'common';

    export default {
        props: ['modal'],
        data() {
            return {
                warnclose: false,
                settings: null,
                closing: false,
                saving: false
            }
        },
        components: {
            Modal,
            SettingsPanel
        },
        computed: {
            changed() {
                return this.settings.categories.find(category => category.changed);
            }
        },
        methods: {
            async saveSettings() {
                if (this.saving) return;
                this.saving = true;
                try {
                    if (this.modal.saveSettings) await this.modal.saveSettings(this.settings);
                    else await this.modal.settings.merge(this.settings);
                } catch (err) {
                    // TODO Display error that settings failed to save
                    Logger.err('SettingsModal', ['Failed to save settings:', err]);
                }
                this.saving = false;
            },
            resetSettings() {
                if (this.saving) return;
                this.cloneSettings();
            },
            cloneSettings() {
                this.settings = this.modal.dont_clone ? this.modal.settings : this.modal.settings.clone();
            }
        },
        created() {
            this.modal.beforeClose = force => {
                if (this.changed && !force) {
                    this.warnclose = true;
                    setTimeout(() => this.warnclose = false, 400);
                    throw {message: 'Settings have been changed'};
                }
            };

            this.modal.settings.on('settings-updated', this.cloneSettings);
            this.cloneSettings();
        },
        destroyed() {
            this.modal.settings.off('settings-updated', this.cloneSettings);
        }
    }
</script>
