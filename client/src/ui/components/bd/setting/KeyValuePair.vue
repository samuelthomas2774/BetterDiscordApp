/**
 * BetterDiscord Setting Key Value Pair Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formKvp">
        <div class="bd-formKvpDetails">
            <div class="bd-inputWrapper">
                <input type="text" class="bd-textInput" :value="setting.value.key" @keyup.stop @input="keyChange"/>
            </div>
            <div class="bd-inputWrapper">
                <input type="text" class="bd-textInput" :value="setting.value.value" @keyup.stop @input="valueChange"/>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['setting'],
        methods: {
            keyChange(e) {
                this.setting.value = { key: e.target.value, value: this.setting.value.value }
            },
            valueChange(e) {
                this.setting.value = { key: this.setting.value.key, value: e.target.value }
            }
        }
    }
</script>
