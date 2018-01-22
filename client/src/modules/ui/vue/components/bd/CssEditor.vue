<template src="./templates/CssEditor.html"></template>

<script>
    const { CssEditor } = require('../../../../');

    /*Imports*/
    import { SettingsWrapper } from './';
    import { SettingSwitch } from '../generic';
    const components = { SettingsWrapper, SettingSwitch };

    function openInternalEditor() {
        CssEditor.show();
    }

    function settingClicked() {
        this.dummySetting.checked = !this.dummySetting.checked;
    }

    export default {
        components,
        methods: { openInternalEditor, settingClicked },
        data() {
            return {
                dummySetting: {
                    title: "Live Update",
                    hint: "Automatically update client css when saved.",
                    checked: true
                }
            }
        }
    }
</script>