<template src="./templates/PluginsView.html"></template>
<script>
    const { PluginManager } = require('../../../../'); //#1 require of 2018~ :3

    /*Imports*/
    import { SettingsWrapper } from './';
    import PluginCard from './PluginCard.vue';
    const components = { SettingsWrapper, PluginCard };

    /*Variables*/

     /*Methods*/
    async function refreshLocalPlugins() {
        try {
            await PluginManager.refreshPlugins();
        } catch (err) {
            
        }
        this.localPlugins = PluginManager.plugins;
    }

    function showLocal() {
        this.local = true;
    }

    function showOnline() {
        this.local = false;
    }

    const methods = { showLocal, showOnline, refreshLocalPlugins };

    export default {
        components,
        data() {
            return {
                localPlugins: [],
                local: true
            }
        },
        methods,
        created: function () {
            this.refreshLocalPlugins();
        }
    }
</script>