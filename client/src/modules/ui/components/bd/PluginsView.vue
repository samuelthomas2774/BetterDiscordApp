<template src="./templates/PluginsView.html"></template>
<script>
    const { PluginManager } = require('../../../'); //#1 require of 2018~ :3

    /*Imports*/
    import { SettingsWrapper } from './';
    import PluginCard from './PluginCard.vue';
    import Refresh from 'vue-material-design-icons/refresh.vue';
    const components = { SettingsWrapper, PluginCard, Refresh };

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
            this.pluginManager.stopPlugin(plugin.name);
        } else {
            this.pluginManager.startPlugin(plugin.name);
        }
    }

    const methods = { showLocal, showOnline, refreshLocalPlugins, togglePlugin };

    export default {
        components,
        data() {
            return {
                local: true,
                pluginManager: PluginManager
            }
        },
        computed: {
            localPlugins: function () {
                return this.pluginManager.plugins;
            }
        },
        methods,
        created: function () {
            this.refreshLocalPlugins();
        }
    }
</script>
