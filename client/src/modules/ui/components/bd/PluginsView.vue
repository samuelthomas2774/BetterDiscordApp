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

<style>
    .bd-spinner-container {
        display: flex;
        flex-grow: 1;
        align-items: center;
        align-content: center;
        justify-content: center;
    }

    .bd-spinner-container .bd-spinner-2 {
        width: 200px;
        height: 200px;
     }

    .bd-pluginsView .bd-button {
        display: flex;
    }

    .bd-pluginsView .bd-button h3 {
        flex-grow: 1;
    } 
    
    .bd-pluginsView .bd-button .material-design-icon {
        display: flex;
        align-items: center;
        fill: #FFF;
    }

    .bd-material-button {
        border-radius: 3px;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
        width: 30px;
        height: 30px;
    }

    .bd-pluginsView .bd-button {
        border-bottom: 2px solid #2b2d31;
        align-items: center;
    }

    .bd-material-button > span {
        display: flex;
    }

    .bd-material-button:hover {
        background: #2d2f34;
    }
</style>