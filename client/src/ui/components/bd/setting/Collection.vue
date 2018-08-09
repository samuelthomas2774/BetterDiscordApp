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
        <template v-for="s in setting.value">
            <KeyValuePair v-if="setting.subtype === 'kvp'" :setting="s" :key="s.id" />
            <Bool v-else-if="setting.subtype === 'bool'" :setting="s" :key="s.id" />
        </template>
    </div>
</template>

<script>
    import KeyValuePair from './KeyValuePair.vue';
    import Bool from './Bool.vue';
    export default {
        props: ['setting'],
        components: { KeyValuePair, Bool },
        mounted() { console.log('collection', this.setting) }
    }
</script>
