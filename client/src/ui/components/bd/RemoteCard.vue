/**
 * BetterDiscord Remote Card Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-remoteCard">
        <div class="bd-flexRow bd-flex">
            <div class="bd-remoteCard-title bd-flexGrow">{{item.name}} v{{item.version}} by {{item.author}}</div>
            <div class="bd-remoteCard-likes">{{item.rating}}</div>
        </div>
        <div class="bd-flexRow bd-flex" :style="{marginTop: '10px'}">
            <div class="bd-remoteCard-thumb" :style="{backgroundImage: `url(${resolveThumb()})`}"></div>
            <div class="bd-remoteCard-infoContainer bd-flex bd-flexCol bd-flexGrow">
                <div class="bd-remoteCard-infoBox bd-flex bd-flexGrow bd-flexCol">
                    <div class="bd-remoteCard-info">{{item.installs}} Installs</div>
                    <div class="bd-remoteCard-info">{{item.activeUsers}} Active Users</div>
                    <div class="bd-remoteCard-info">Updated: Some time ago</div>
                </div>
            </div>
        </div>
        <div class="bd-flexRow bd-flex bd-flexGrow">
            <div class="bd-flexGrow bd-remoteCard-tags">{{item.tags.join(', ')}}</div>
            <div class="bd-button-group">
                <div class="bd-button">Install</div>
                <div class="bd-button">Preview</div>
                <div class="bd-button">Source</div>
            </div>
        </div>
    </div>
</template>

<script>
    import { WebpackModules } from 'modules';
    export default {
        props: ['item'],
        data() {
            return {}
        },
        methods: {
            resolveThumb() {
                window.momentTest = WebpackModules;
                return `${this.item.repository.rawUri}/${this.item.files.previews[0].thumb}`;
            }
        }
    }
</script>
