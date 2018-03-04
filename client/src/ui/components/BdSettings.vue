/**
 * BetterDiscord Settings Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-settings" :class="{active: active, 'bd-settings-out': activeIndex === -1 && lastActiveIndex >= 0}" @keyup="close">
        <SidebarView :contentVisible="this.activeIndex >= 0 || this.lastActiveIndex >= 0" :animating="this.animating" :class="{'bd-stop': !first}">
            <Sidebar slot="sidebar">
                <div class="bd-settings-x" @click="close">
                    <MiClose size="17"/>
                    <span class="bd-x-text">ESC</span>
                </div>
                <SidebarItem v-for="item in sidebarItems" :item="item" :key="item.id" :onClick="itemOnClick" />
            </Sidebar>
            <div slot="sidebarfooter" class="bd-info">
                <span class="bd-vtext">v2.0.0a by Jiiks/JsSucks</span>
                <div @click="openGithub" v-tooltip="'GitHub'" class="bd-material-button">
                    <MiGithubCircle size="16" />
                </div>
                <div @click="openTwitter" v-tooltip="'@Jiiksi'" class="bd-material-button">
                    <MiTwitterCircle size="16" />
                </div>
                <div @click="openWebsite" v-tooltip="'BetterDiscord'" class="bd-material-button">
                    <MiWeb size="16" />
                </div>
            </div>
            <ContentColumn slot="content">
                <div v-for="set in Settings.settings" v-if="!set.hidden && activeContent(set.id) || animatingContent(set.id)" :class="{active: activeContent(set.id), animating: animatingContent(set.id)}">
                    <SettingsWrapper :headertext="set.headertext">
                        <SettingsPanel :settings="set" :schemes="set.schemes" />
                    </SettingsWrapper>
                </div>
                <div v-if="activeContent('css') || animatingContent('css')" :class="{active: activeContent('css'), animating: animatingContent('css')}">
                    <CssEditorView />
                </div>
                <div v-if="activeContent('plugins') || animatingContent('plugins')" :class="{active: activeContent('plugins'), animating: animatingContent('plugins')}">
                    <PluginsView />
                </div>
                <div v-if="activeContent('themes') || animatingContent('themes')" :class="{active: activeContent('themes'), animating: animatingContent('themes')}">
                    <ThemesView />
                </div>
            </ContentColumn>
        </SidebarView>
    </div>
</template>
<script>
    // Imports
    import { shell } from 'electron';
    import { Settings } from 'modules';
    import { SidebarView, Sidebar, SidebarItem, ContentColumn } from './sidebar';
    import { SettingsWrapper, SettingsPanel, CssEditorView, PluginsView, ThemesView } from './bd';
    import { SvgX, MiGithubCircle, MiWeb, MiClose, MiTwitterCircle } from './common';

    // Constants
    const sidebarItems = [
        { text: 'Internal', _type: 'header' },
        { id: 0, contentid: "core", text: 'Core', active: false, _type: 'button' },
        { id: 1, contentid: "ui", text: 'UI', active: false, _type: 'button' },
        { id: 2, contentid: "emotes", text: 'Emotes', active: false, _type: 'button' },
        { id: 3, contentid: "css", text: 'CSS Editor', active: false, _type: 'button' },
        { text: 'External', _type: 'header' },
        { id: 4, contentid: "plugins", text: 'Plugins', active: false, _type: 'button' },
        { id: 5, contentid: "themes", text: 'Themes', active: false, _type: 'button' }
    ];

    export default {
        data() {
            return {
                sidebarItems,
                activeIndex: -1,
                lastActiveIndex: -1,
                animating: false,
                first: true,
                Settings,
                timeout: null
            }
        },
        props: ['active', 'close'],
        components: {
            SidebarView, Sidebar, SidebarItem, ContentColumn,
            SettingsWrapper, SettingsPanel, CssEditorView, PluginsView, ThemesView,
            MiGithubCircle, MiWeb, MiClose, MiTwitterCircle
        },
        methods: {
            itemOnClick(id) {
                if (this.animating || id === this.activeIndex) return;
                if (this.activeIndex >= 0) this.sidebarItems.find(item => item.id === this.activeIndex).active = false;
                this.sidebarItems.find(item => item.id === id).active = true;
                this.animating = true;
                this.lastActiveIndex = this.activeIndex;
                this.activeIndex = id;

                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.first = false;
                    this.animating = false;
                    this.lastActiveIndex = -1;
                    this.timeout = null;
                }, 400);
            },
            activeContent(s) {
                const item = this.sidebarItems.find(item => item.contentid === s);
                return item && item.id === this.activeIndex;
            },
            animatingContent(s) {
                const item = this.sidebarItems.find(item => item.contentid === s);
                return item && item.id === this.lastActiveIndex;
            },
            closeContent() {
                if (this.activeIndex >= 0) this.sidebarItems.find(item => item.id === this.activeIndex).active = false;
                this.first = true;
                this.lastActiveIndex = this.activeIndex;
                this.activeIndex = -1;

                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.animating = false;
                    this.lastActiveIndex = -1;
					this.timeout = null;
                }, 400);
            },
            openGithub() {
                shell.openExternal('https://github.com/JsSucks/BetterDiscordApp');
            },
            openWebsite() {
                shell.openExternal('https://betterdiscord.net');
            },
            openTwitter() {
                shell.openExternal('https://twitter.com/Jiiksi');
            }
        },
        watch: {
            active(active) {
                if (active) return;
                this.closeContent();
            }
        }
    }
</script>
