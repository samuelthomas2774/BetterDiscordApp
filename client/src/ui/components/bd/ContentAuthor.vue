/**
 * BetterDiscord Content Author Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <v-popover class="bd-content-author bd-inline" popoverClass="bd-popover bd-content-author-links" trigger="click" placement="top" :disabled="!hasLinks">
        <!-- <template v-if="typeof author === 'string'">{{ author }}</template>
        <a v-else-if="author.url" :href="author.url" @click="openLink">{{ author.name }}</a>
        <a v-else-if="author.github_username" :href="'https://github.com/' + author.github_username" @click="openLink">{{ author.name }}</a>
        <span v-else-if="author.discord_id" @click="openUserProfileModal(author.discord_id)">{{ author.name }}</span>
        <template v-else>{{ author.name }}</template> -->

        <span :class="{'bd-content-author-link': hasLinks}">{{ author.name || author }}</span><span v-text="after" @click.stop></span>

        <template slot="popover">
            <div v-if="author.discord_id" @click="openUserProfileModal(author.discord_id)" v-tooltip="author.discord_username || author.name" class="bd-material-button"><MiDiscord size="16" /></div>
            <div v-if="author.github_username" @click="openGitHub" v-tooltip="author.github_username" class="bd-material-button"><MiGithubCircle size="16" /></div>
            <div v-if="author.twitter_username" @click="openTwitter" v-tooltip="'@' + author.twitter_username" class="bd-material-button"><MiTwitterCircle size="16" /></div>
            <div v-if="author.url" @click="openWebsite" v-tooltip="author.url" class="bd-material-button"><MiWeb size="16" /></div>
        </template>
    </v-popover>
</template>

<script>
    // Imports
    import { WebpackModules } from 'modules';
    import { BdMenu } from 'ui';
    import { shell } from 'electron';
    import { MiGithubCircle, MiWeb, MiTwitterCircle, MiDiscord } from '../common';

    export default {
        props: ['author', 'after'],
        components: {
            MiGithubCircle, MiWeb, MiTwitterCircle, MiDiscord
        },
        computed: {
            hasLinks() {
                return this.author.discord_id || this.author.github_username || this.author.twitter_username || this.author.url;
            }
        },
        methods: {
            openLink(e) {
                shell.openExternal(e.target.href);
                e.preventDefault();
            },
            openUserProfileModal(discord_id) {
                const UserProfileModal = WebpackModules.getModuleByProps(['fetchMutualFriends', 'setSection']);
                UserProfileModal.open(discord_id);
                BdMenu.close();
            },
            openGitHub() {
                shell.openExternal(`https://github.com/${this.author.github_username}`);
            },
            openWebsite() {
                shell.openExternal(this.author.url);
            },
            openTwitter() {
                shell.openExternal(`https://twitter.com/${this.author.twitter_username}`);
            }
        }
    }
</script>
