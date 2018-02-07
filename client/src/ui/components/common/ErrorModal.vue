/**
 * BetterDiscord Error Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-modal-error" :class="{'bd-open': content.showStack}">
        <div class="bd-modal-error-title bd-flex">
            <span class="bd-modal-title-text bd-flex-grow">{{content.message}}</span>
            <span class="bd-modal-titlelink" v-if="content.showStack" @click="hideStack(content)">Hide Stacktrace</span>
            <span class="bd-modal-titlelink" v-else @click="showStack(content)">Show Stacktrace</span>
        </div>
        <div class="bd-scroller-wrap">
            <div class="bd-scroller">
                <div class="bd-modal-error-body"><span>{{content.err.message}}</span>
                {{content.stackTrace}}</div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['content', 'hideStack', 'showStack']
    }
</script>
