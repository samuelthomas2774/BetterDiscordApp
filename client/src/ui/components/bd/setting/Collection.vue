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
        <template v-for="s in setting.items">
            <Setting :setting="s" :key="s.id" />
        </template>
    </div>
</template>

<script>
    import Setting from './Setting.vue';

    export default {
        props: ['setting'],
        components: {},
        beforeCreate() {
            // https://vuejs.org/v2/guide/components.html#Circular-References-Between-Components
            this.$options.components.Setting = Setting;
        },
        mounted() {
            console.log('collection', this.setting);
        }
    }
</script>
