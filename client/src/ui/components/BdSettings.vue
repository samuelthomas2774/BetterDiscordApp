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
    <div class="bd-settings" :class="{active: active}" @keyup="close">
        <SidebarView :contentVisible="this.activeIndex >= 0" :animating="this.animating">
            <Sidebar slot="sidebar">
                <div class="bd-settings-x" @click="close">
                    <SvgX size="17"/>
                    <span>ESC</span>
                </div>
                <SidebarItem v-for="item in sidebarItems" :item="item" :key="item.id" :onClick="itemOnClick" />
                <div class="bd-info">
                    <span>v2.0.0a by Jiiks/JsSucks</span>
                </div>
            </Sidebar>
            <ContentColumn slot="content">
                <div v-if="activeContent('core') || animatingContent('core')" :class="{active: activeContent('core'), animating: animatingContent('core')}">
                    <CoreSettings :settings="coreSettings" :enableSetting="enableSetting" :disableSetting="disableSetting" />
                </div>
                <div v-if="activeContent('ui') || animatingContent('ui')" :class="{active: activeContent('ui'), animating: animatingContent('ui')}">
                    <UISettings />
                </div>
                <div v-if="activeContent('css') || animatingContent('css')" :class="{active: activeContent('css'), animating: animatingContent('css')}">
                    <CssEditorView />
                </div>
                <div v-if="activeContent('emotes') || animatingContent('emotes')" :class="{active: activeContent('emotes'), animating: animatingContent('emotes')}">
                    <EmoteSettings />
                </div>
                <div v-if="activeContent('plugins') || animatingContent('plugins')" :class="{active: activeContent('plugins'), animating: animatingContent('plugins')}">
                    <PluginsView />
                </div>
            </ContentColumn>
        </SidebarView>
    </div>
</template>
<script>
    // Imports
    import { SidebarView, Sidebar, SidebarItem, ContentColumn } from './sidebar';
    import { SvgX } from './common';

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
                first: true
            }
        },
        props: ['active', 'close'],
        components: {
            SidebarView, Sidebar, SidebarItem, ContentColumn, SvgX
        },
        methods: {
            itemOnClick() {

            },
            activeContent() {
                return false;
            },
            animatingContent() {
                return false;
            }
        }
    }
</script>