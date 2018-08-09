/**
 * BetterDiscord Setting Bool Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formCollection">
        <div v-for="(s, index) in setting.items" class="bd-collectionItem">
            <KeyValuePair v-if="setting.subtype === 'kvp'" :setting="s" :key="s.id"/>
            <Bool v-else-if="setting.subtype === 'bool'" :setting="s" :key="s.id" />
            <div class="bd-removeCollectionItem" @click="() => removeItem(index)"><MiMinus/></div>
        </div>
        <div class="bd-newCollectionItem" @click="addItem">+</div>
    </div>
</template>

<script>
    import { Settings } from 'modules';
    import { Setting } from 'structs';
    import KeyValuePair from './KeyValuePair.vue';
    import Bool from './Bool.vue';

    import { MiMinus } from '../../common';
    export default {
        props: ['setting'],
        components: { KeyValuePair, Bool, MiMinus },
        methods: {
            removeItem(index) {
                this.setting.value = this.setting.items.splice(index, 1);
            },
            addItem() {
                const add = new Setting({ type: this.setting.subtype });
                this.setting.items = this.setting.value = [...this.setting.items, add];
            }
        }
    }
</script>
