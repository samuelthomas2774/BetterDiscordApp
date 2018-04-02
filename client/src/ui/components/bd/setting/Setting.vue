/**
 * BetterDiscord Setting Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-item" :class="{'bd-form-item-changed': setting.changed, 'bd-disabled': disabled, 'bd-form-item-noheader': !setting.text, 'bd-form-item-fullwidth': setting.fullwidth}">
        <BoolSetting v-if="setting.type === 'bool'" :setting="setting" />
        <StringSetting v-if="setting.type === 'text' && !setting.multiline" :setting="setting" />
        <MultilineTextSetting v-if="setting.type === 'text' && setting.multiline" :setting="setting" />
        <NumberSetting v-if="setting.type === 'number'" :setting="setting" />
        <DropdownSetting v-if="setting.type === 'dropdown'" :setting="setting" />
        <RadioSetting v-if="setting.type === 'radio'" :setting="setting" />
        <SliderSetting v-if="setting.type === 'slider'" :setting="setting" />
        <ColourSetting v-if="setting.type === 'colour'" :setting="setting" />
        <KeybindSetting v-if="setting.type === 'keybind'" :setting="setting" />
        <FileSetting v-if="setting.type === 'file'" :setting="setting" />
        <GuildSetting v-if="setting.type === 'guild'" :setting="setting" />
        <ArraySetting v-if="setting.type === 'array'" :setting="setting" />
        <CustomSetting v-if="setting.type === 'custom'" :setting="setting" />
        <div class="bd-form-divider"></div>
    </div>
</template>

<script>
    // Imports
    import BoolSetting from './Bool.vue';
    import DropdownSetting from './Dropdown.vue';
    import NumberSetting from './Number.vue';
    import RadioSetting from './Radio.vue';
    import StringSetting from './String.vue';
    import MultilineTextSetting from './Multiline.vue';
    import SliderSetting from './Slider.vue';
    import ColourSetting from './Colour.vue';
    import KeybindSetting from './Keybind.vue';
    import FileSetting from './File.vue';
    import GuildSetting from './Guild.vue';
    import ArraySetting from './Array.vue';
    import CustomSetting from './Custom.vue';

    export default {
        props: [
            'setting'
        ],
        components: {
            BoolSetting,
            DropdownSetting,
            NumberSetting,
            RadioSetting,
            StringSetting,
            MultilineTextSetting,
            SliderSetting,
            ColourSetting,
            KeybindSetting,
            FileSetting,
            GuildSetting,
            ArraySetting,
            CustomSetting
        },
        computed: {
            changed() {
                return this.setting.changed || false;
            },
            disabled() {
                return this.setting.disabled || false;
            }
        }
    }
</script>
