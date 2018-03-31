/**
 * BetterDiscord Card Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-card">
        <div class="bd-card-header">
            <div class="bd-card-icon" :style="{backgroundImage: item.icon ? `url(${item.icon})` : null}">
                <MiExtension v-if="!item.icon" :size="30" />
            </div>
            <span>{{item.name}}</span>
            <div class="bd-flex-spacer" />
            <slot name="toggle"/>
        </div>
        <div class="bd-card-body">
            <div class="bd-card-description">{{item.description}}</div>
            <div class="bd-card-footer">
                <div class="bd-card-extra">
                    v{{item.version}} by
                    <template v-for="(author, i) in item.authors">
                        <ContentAuthor :author="author" :after="i === item.authors.length - 1 ? '' : i === item.authors.length - 2 ? ' and' : ','" />
                    </template>
                </div>
                <div class="bd-controls">
                    <slot name="controls" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    // Imports
    import { MiExtension } from '../common';
    import ContentAuthor from './ContentAuthor.vue';

    export default {
        props: ['item'],
        components: {
            ContentAuthor,
            MiExtension
        }
    }
</script>
