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
            <div class="bd-card-icon" :style="{backgroundImage: iconURL}">
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
    import { FileUtils, ClientLogger as Logger } from 'common';
    import path from 'path';
    import { MiExtension } from '../common';
    import ContentAuthor from './ContentAuthor.vue';

    export default {
        props: ['item'],
        data() {
            return {
                iconURL: undefined
            };
        },
        components: {
            ContentAuthor,
            MiExtension
        },
        methods: {
            async getIconURL() {
                if (!this.item.icon) return;

                try {
                    if (this.item.icon.substr(0, 5) === 'data:') {
                        return `url(${this.item.icon})`;
                    }

                    const iconPath = path.join(this.item.contentPath, this.item.icon);
                    const iconURL = await FileUtils.toDataURI(iconPath, this.item.info.icon_type);
                    return `url(${iconURL})`;
                } catch (err) {
                    Logger.err('ContentCard', ['Invalid icon URL', this.item]);
                }
            }
        },
        async created() {
            this.iconURL = await this.getIconURL();
        }
    }
</script>
