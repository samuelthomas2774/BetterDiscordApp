/**
 * BetterDiscord Updater View Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="Updates">
        <div class="bd-flex bd-flexCol bd-updaterview">
            
        </div>
    </SettingsWrapper>
</template>

<script>
    import { Globals, Updater } from 'modules';
    import { ClientLogger as Logger } from 'common';
    import SettingsWrapper from './SettingsWrapper.vue';
    import { FormButton } from '../common';

    export default {
        data() {
            return {
                currentVersion: Globals.version,
                updating: false,
                updater: Updater
            };
        },
        components: {
            SettingsWrapper,
            FormButton
        },
        computed: {
            updatesAvailable() {
                return false;
            },
            newVersion() {
                return '2.0.0-beta.4';
            },
            error() {
                return null;
            }
        },
        methods: {
            async install() {

            }
        }
    }
</script>
