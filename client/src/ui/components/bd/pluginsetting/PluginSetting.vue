/**
 * BetterDiscord Plugin Setting Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-item">
        <BoolSetting v-if="setting.type === 'bool'" :setting="setting" :change="change"/>
        <StringSetting v-if="setting.type === 'text'" :setting="setting" :change="change"/>
        <div class="bd-form-divider"></div>
    </div>
</template>
<script>
    // Imports
    import BoolSetting from './Bool.vue';
    import StringSetting from './String.vue';

    export default {
        props: ['setting', 'change'],
        components: {
            BoolSetting, StringSetting
        }
    }
</script>
