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
            <slot name="toggle" />
        </div>
        <div class="bd-card-body">
            <slot name="body">
                <div class="bd-card-description">{{ item.description }}</div>
            </slot>
        </div>
        <div class="bd-card-footer">
            <div class="bd-card-extra">v{{item.version}} by {{item.authors.join(', ').replace(/,(?!.*,)/gmi, ' and')}}</div>
            <div class="bd-controls">
                <slot name="controls" />
            </div>
        </div>
    </div>
</template>
<script>
    // Imports
    import { MiExtension } from '../common';

    export default {
        props: ['item'],
        components: {
            MiExtension
        }
    }
</script>
