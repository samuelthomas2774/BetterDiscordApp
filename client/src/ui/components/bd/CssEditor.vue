/**
 * BetterDiscord Css Editor Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template src="./templates/CssEditor.html">
</template>

<script>
    const { CssEditor } = require('../../../');

    /*Imports*/
    import { SettingsWrapper } from './';
    import { SettingSwitch, FormButton } from '../generic';
    const components = { SettingsWrapper, SettingSwitch, FormButton };

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
