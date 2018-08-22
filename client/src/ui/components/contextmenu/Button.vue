/**
 * BetterDiscord Context Menu Button Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-cmItem" :style="{color: item.color || ''}" @click="$emit('click', $event)">
        <span>{{item.text}}</span>
        <div class="bd-cmHint" v-if="item.hint">{{item.hint}}</div>
        <img :src="item.icon" v-else-if="item.icon"/>
    </div>
</template>

<script>
    export default {
        props: ['item']
    }
</script>
