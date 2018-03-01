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
            <button class="bd-button bd-button-primary" :class="{'bd-disabled': setting.disabled || setting.max && items.length >= setting.max}" @click="() => addItem(!setting.inline)">Add</button>
        </div>
        <div class="bd-hint">{{ setting.hint }}</div>
        <div class="bd-settingsarray-items">
            <div class="bd-settingsarray-item" v-for="(item, index) in items">
                <div class="bd-settingsarray-item-marker">{{ index + 1 }}</div>

                <SettingsPanel class="bd-settingsarray-item-contents" v-if="setting.inline" :settings="item.settings" :change="(c, s, v) => changeInItem(item, c, s, v)" />
                <div class="bd-settingsarray-item-contents" v-else>
                    <div class="bd-settingsarray-item-hint">
                        <span v-if="item.settings[0] && item.settings[0].settings[0]">{{ item.settings[0].settings[0].text }}: {{ item.settings[0].settings[0].value }}</span><span v-if="item.settings[0] && item.settings[0].settings[1]">, {{ item.settings[0].settings[1].text }}: {{ item.settings[0].settings[1].value }}</span><span v-if="item.settings[0] && item.settings[0].settings[2] || item.settings[1] && item.settings[1].settings[0]">, ...</span>
                    </div>
                </div>

                <div class="bd-settingsarray-item-controls">
                    <span class="bd-settingsarray-open" v-if="typeof setting.allow_external !== 'undefined' ? setting.allow_external || !setting.inline : true" @click="() => showModal(item, index)"><MiOpenInNew v-if="setting.inline" /><MiSettings v-else /></span>
                    <span class="bd-settingsarray-remove" :class="{'bd-disabled': setting.disabled || setting.min && items.length <= setting.min}" @click="() => removeItem(item)"><MiMinus /></span>
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
        data() {
            return {
                items: []
            };
        },
        watch: {
            setting(value) {
                // this.setting was changed
                this.reloadSettings();
            }
        },
        methods: {
            addItem(openModal) {
                if (this.setting.disabled || this.setting.max && this.items.length >= this.setting.max) return;
                const item = { settings: this.getItemSettings({}) };
                if (openModal) this.showModal(item, this.items.length);
                this.items.push(item);
                this.update();
            },
            removeItem(item) {
                if (this.setting.disabled || this.setting.min && this.items.length <= this.setting.min) return;
                this.items = this.items.filter(i => i !== item);
                this.update();
            },
            changeInItem(item, category_id, setting_id, value) {
                console.log('Setting', item, category_id, setting_id, 'to', value);

                const category = item.settings.find(c => c.category === category_id);
                if (!category) return;

                const setting = category.settings.find(s => s.id === setting_id);
                if (!setting || Utils.compare(setting.value, value)) return;

                setting.value = value;
                setting.changed = !Utils.compare(setting.value, setting.old_value);
                this.update();
            },
            update() {
                this.change(this.items.map(item => ({
                    settings: item.settings ? item.settings.map(category => ({
                        category: category.category,
                        settings: category.settings.map(setting => ({
                            id: setting.id,
                            value: setting.value
                        }))
                    })) : []
                })));
            },
            showModal(item, index) {
                Modals.settings(this.setting.headertext ? this.setting.headertext.replace(/%n/, index + 1) : this.setting.text + ` #${index + 1}`, item.settings, this.setting.schemes, () => this.update());
            },
            getItemSettings(item) {
                const settings = JSON.parse(JSON.stringify(this.setting.settings));
                const newSettings = item.settings || [];

                for (let newCategory of newSettings) {
                    const category = settings.find(c => c.category === newCategory.category);
                    if (!category) continue;
                    for (let newSetting of newCategory.settings) {
                        const setting = category.settings.find(s => s.id === newSetting.id);
                        if (!setting) continue;
                        setting.value = setting.old_value = newSetting.value;
                        setting.changed = false;
                    }
                }

                return settings;
            },
            reloadSettings() {
                this.items = JSON.parse(JSON.stringify(this.setting.value)) || [];
                this.items = this.items.map(item => ({ settings: this.getItemSettings(item) }));
            }
        },
        beforeCreate() {
            // https://vuejs.org/v2/guide/components.html#Circular-References-Between-Components
            this.$options.components.SettingsPanel = SettingsPanel;
        },
        beforeMount() {
            this.reloadSettings();
        }
    }
</script>
