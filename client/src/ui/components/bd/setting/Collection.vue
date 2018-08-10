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
            <Setting :setting="s" :key="s.id" />
            <div class="bd-removeCollectionItem" @click="removeItem(s)"><MiMinus/></div>
        </div>
        <div class="bd-newCollectionItem" @click="addItem"><MiPlus/></div>
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
                this.setting.removeItem(item);
            },
            addItem() {
                this.setting.addItem();
            }
        },
        beforeCreate() {
            // https://vuejs.org/v2/guide/components.html#Circular-References-Between-Components
            this.$options.components.Setting = Setting;
        }
    }
</script>
