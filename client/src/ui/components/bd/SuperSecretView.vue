/**
 * BetterDiscord Developer View Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="Super Secret">
        <div class="bd-flex bd-flexCol bd-devview">
            <FormButton @click="forceUpdate">Force Update</FormButton>
            <FormButton @click="debugConfig">Config Debug</FormButton>
        </div>
    </SettingsWrapper>
</template>

<script>

    import SettingsWrapper from './SettingsWrapper.vue';
    import { FormButton } from '../common';
    import { Globals } from 'modules';
    import { ClientIPC } from 'common';

    export default {
        data() {
            return {
            };
        },
        components: {
            SettingsWrapper,
            FormButton
        },
        methods: {
            forceUpdate() {
                ClientIPC.send('debug-updater-forceUpdate');
            },
            debugConfig() {
                console.log(Globals);
            }
        }
    }
</script>
