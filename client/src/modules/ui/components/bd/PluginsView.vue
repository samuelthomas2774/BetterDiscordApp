<template src="./templates/PluginsView.html"></template>
<script>
    const { PluginManager, Plugin } = require('../../../'); 

    /*Imports*/
    import { SettingsWrapper } from './';
    import PluginSettingsModal from './PluginSettingsModal.vue';
    import PluginCard from './PluginCard.vue';
    import Refresh from 'vue-material-design-icons/refresh.vue';
    const components = { SettingsWrapper, PluginCard, Refresh, PluginSettingsModal };

    /*Variables*/

     /*Methods*/
    async function refreshLocalPlugins() {
        try {
            await PluginManager.refreshPlugins();
        } catch (err) {
            
        }
    }

    function showLocal() {
        this.local = true;
    }

    function showOnline() {
        this.local = false;
    }

    function togglePlugin(plugin) {
       if (plugin.enabled) {
            this.pluginManager.stopPlugin(plugin);
        } else {
            this.pluginManager.startPlugin(plugin);
       }
    }

    function reloadPlugin(plugin) {
        this.pluginManager.reloadPlugin(plugin.name);
    }

    function showSettings(plugin) {
        this.settingsOpen = plugin;
    }

    const methods = { showLocal, showOnline, refreshLocalPlugins, togglePlugin, reloadPlugin, showSettings };

    export default {
        components,
        data() {
            return {
                local: true,
                pluginManager: PluginManager,
                settingsOpen: null
            }
        },
        computed: {
            localPlugins: function () {
                return this.pluginManager.plugins;
            }
        },
        methods
    }
</script>