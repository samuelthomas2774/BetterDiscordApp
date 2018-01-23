<template>
    <SettingsWrapper headertext="Core Settings">
        <div class="bd-form-item"  v-for="setting in settings" :key="setting.id">
            <SettingSwitch key="setting.id" :setting="setting" :onClick="settingOnClick" :disabled="setting.disabled"/>
            <div class="bd-form-divider"/>
         </div>
    </SettingsWrapper>
</template>

<script>
    /*Imports*/
    import { SettingsWrapper } from './';
    import { SettingSwitch } from '../generic';
    const components = { SettingsWrapper, SettingSwitch };

    /*Methods*/
    function settingOnClick(setting) {
        if (setting.enabled) return this.disableSetting('core', setting.id);
        this.enableSetting('core', setting.id);
    }

    const methods = { settingOnClick };

    export default {
        components,
        methods,
        props: ['settings', 'enableSetting', 'disableSetting']
    }
</script>