/**
 * BetterDiscord Setting Array Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-settingsarray" :class="{'bd-form-settingsarray-inline': setting.inline}">
        <div class="bd-title">
            <h3>{{ setting.text }}</h3>
            <button class="bd-button bd-button-primary" :class="{'bd-disabled': setting.disabled || setting.max && setting.items.length >= setting.max}" @click="() => addItem(!setting.inline)">Add</button>
        </div>
        <div class="bd-hint">{{ setting.hint }}</div>
        <div class="bd-settingsarray-items">
            <div class="bd-settingsarray-item" v-for="(item, index) in setting.items">
                <div class="bd-settingsarray-item-marker">{{ index + 1 }}</div>

                <SettingsPanel class="bd-settingsarray-item-contents" v-if="setting.inline" :settings="item" />
                <div class="bd-settingsarray-item-contents" v-else>
                    <div class="bd-settingsarray-item-hint">
                        <span v-if="getItemSettings(item)[0]">{{ getItemSettings(item)[0].text }}: {{ getItemSettings(item)[0].value }}</span><span v-if="getItemSettings(item)[1]">, {{ getItemSettings(item)[1].text }}: {{ getItemSettings(item)[1].value }}</span><span v-if="getItemSettings(item)[2]">, ...</span>
                    </div>
                </div>

                <div class="bd-settingsarray-item-controls">
                    <span class="bd-settingsarray-open" v-if="setting.allow_external" @click="() => showModal(item, index)"><MiOpenInNew v-if="setting.inline" /><MiSettings v-else /></span>
                    <span class="bd-settingsarray-remove" :class="{'bd-disabled': setting.disabled || setting.min && setting.items.length <= setting.min}" @click="() => removeItem(item)"><MiMinus /></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { shell } from 'electron';
    import { Utils, ClientIPC } from 'common';
    import { MiSettings, MiOpenInNew, MiMinus } from '../../common';
    import { Modals } from 'ui';
    import SettingsPanel from '../SettingsPanel.vue';

    export default {
        props: ['setting', 'change'],
        components: {
            MiSettings, MiOpenInNew, MiMinus
        },
        methods: {
            addItem(openModal) {
                if (this.setting.disabled || this.setting.max && this.setting.items.length >= this.setting.max) return;
                const item = this.setting.addItem();
                if (openModal) this.showModal(item, this.setting.items.length);
            },
            removeItem(item) {
                if (this.setting.disabled || this.setting.min && this.setting.items.length <= this.setting.min) return;
                this.setting.removeItem(item);
            },
            changeInItem(item, category_id, setting_id, value) {
                console.log('Setting', item, category_id, setting_id, 'to', value);

                const category = item.settings.find(c => c.category === category_id);
                if (!category) return;

                const setting = category.settings.find(s => s.id === setting_id);
                if (!setting || Utils.compare(setting.value, value)) return;

                setting.value = value;
                setting.changed = !Utils.compare(setting.value, setting.old_value);
            },
            showModal(item, index) {
                Modals.settings(item, this.setting.headertext ? this.setting.headertext.replace(/%n/, index + 1) : this.setting.text + ` #${index + 1}`);
            },
            getItemSettings(item) {
                return item.findSettings(() => true);
            }
        },
        beforeCreate() {
            // https://vuejs.org/v2/guide/components.html#Circular-References-Between-Components
            this.$options.components.SettingsPanel = SettingsPanel;
        }
    }
</script>
