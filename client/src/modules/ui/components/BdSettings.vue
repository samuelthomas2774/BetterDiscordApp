<template src="./templates/BdSettings.html"></template>

<script>

    const { Settings } = require('../../');

    /*Imports*/
    import { SidebarView, Sidebar, SidebarItem, ContentColumn } from './sidebar';
    import { CoreSettings, UISettings, EmoteSettings, PluginsView, CssEditorView } from './bd';
    const components = { SidebarView, Sidebar, SidebarItem, ContentColumn, CoreSettings, UISettings, EmoteSettings, PluginsView, CssEditorView };

    /*Constants*/
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

    /*Methods*/
    function itemOnClick(id) {
        if (this.animating || id === this.activeIndex) return;
        if (this.activeIndex >= 0) this.sidebarItems.find(item => item.id === this.activeIndex).active = false;
        this.sidebarItems.find(item => item.id === id).active = true;
        this.animating = true;
        this.lastActiveIndex = this.activeIndex;
        this.activeIndex = id;

        if (this.first) {
            this.first = false;
        }

        setTimeout(() => {
            this.animating = false;
            this.lastActiveIndex = -1;
        }, 400);
    }

    function animatingContent(s) {
        const item = this.sidebarItems.find(item => item.contentid === s);
        if (!item) return false;
        return item.id === this.lastActiveIndex;
    }

    function activeContent(s) {
        const item = this.sidebarItems.find(item => item.contentid === s);
        if (!item) return false;
        return item.id === this.activeIndex;
    }

    function enableSetting(cat, id) {
        switch (cat) {
            case 'core':
                return this.coreSettings.find(setting => setting.id === id).enabled = true;
        }
    }

    function disableSetting(cat, id) {
        switch (cat) {
            case 'core':
                return this.coreSettings.find(setting => setting.id === id).enabled = false;
        }
    }

    const methods = { itemOnClick, animatingContent, activeContent, enableSetting, disableSetting };

    export default {
        components,
        props: ['active', 'close'],
        methods,
        data() {
            return {
                sidebarItems,
                activeIndex: -1,
                lastActiveIndex: -1,
                animating: false,
                first: true,
                settings: Settings.getSettings
            }
        },
        computed: {
            coreSettings: function () {
                return this.settings.find(settingset => settingset.id === 'core').settings;
            }
        },
        updated: function () {
            if (this.active) return;
            this.activeIndex = this.lastActiveIndex = -1;
            this.sidebarItems.forEach(item => item.active = false);
        }
    }
</script>