<template src="./templates/BdSettingsWrapper.html"></template>
<script>
    const { BDIpc, Events } = require('../../');

    /*Imports*/
    import BdSettings from './BdSettings.vue';
    const components = { BdSettings };

    /*Methods*/
    function showSettings() {
        if (!this.loaded) return;
        this.active = true;
    }
    function hideSettings() {
        this.active = false;
    }

    const methods = { showSettings, hideSettings };

    let globalKeyListener;
    let ipcEventShow;
    let ipcEventToggle;
    let ipcEventHide;

    export default {
        components,
        methods,
        data() {
            return {
                loaded: false,
                active: false,
                platform: global.process.platform
            }
        },
        created: function () {

            Events.on('ready', e => {
                this.loaded = true;
            });

            window.addEventListener('keyup', globalKeyListener = e => {
                if (!this.active || e.which !== 27) return;
                this.hideSettings();
                e.stopImmediatePropagation();
            });
            BDIpc.on('bd-toggle-menu', ipcEventToggle = () => !this.active ? this.showSettings() : this.hideSettings());
            BDIpc.on('bd-show-menu', ipcEventShow = () => this.showSettings());
            BDIpc.on('bd-hide-menu', ipcEventHide = () => this.hideSettings());
        },
        destroyed: function () {
            if (globalKeyListener) window.removeEventListener('keyup', globalKeyListener);
            if (ipcEventShow) BDIpc.off('bd-toggle-menu', ipcEventShow);
            if (ipcEventToggle) BDIpc.off('bd-show-menu', ipcEventToggle);
            if (ipcEventHide) BDIpc.off('bd-hide-menu', ipcEventHide);
        }
    }
</script>
