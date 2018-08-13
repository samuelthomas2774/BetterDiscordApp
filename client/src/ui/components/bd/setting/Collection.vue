/**
 * BetterDiscord Collection Setting Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formCollection">
        <div v-for="s in setting.items" class="bd-collectionItem">
            <Setting :setting="s" :hide-divider="true" :key="s.id" />
            <div class="bd-removeCollectionItem" :class="{'bd-disabled': setting.disabled || setting.min && setting.items.length <= setting.min}" @click="removeItem(s)"><MiMinus/></div>
        </div>
        <div v-if="!setting.disabled && !setting.max || setting.items.length < setting.max" class="bd-newCollectionItem" @click="addItem"><MiPlus/></div>
    </div>
</template>

<script>
    import Setting from './Setting.vue';
    import { MiMinus, MiPlus } from '../../common';

    export default {
        props: ['setting'],
        components: {
            MiMinus, MiPlus
        },
        methods: {
            removeItem(item) {
                if (this.setting.disabled || this.setting.min && this.setting.items.length <= this.setting.min) return;
                this.setting.removeItem(item);
            },
            addItem() {
                if (this.setting.disabled || this.setting.max && this.setting.items.length >= this.setting.max) return;
                this.setting.addItem();
            }
        },
        beforeCreate() {
            // https://vuejs.org/v2/guide/components.html#Circular-References-Between-Components
            this.$options.components.Setting = Setting;
        }
    }
</script>
