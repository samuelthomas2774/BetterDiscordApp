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
            <FormButton @click="testUpdateUi">Update UI Test</FormButton>
        </div>
    </SettingsWrapper>
</template>

<script>

    import SettingsWrapper from './SettingsWrapper.vue';
    import { FormButton } from '../common';
    import { Globals, Events, Updater } from 'modules';
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
            },
            testUpdateUi() {
                Updater.testUi({
                    'bd': [
                        {
                            'id': 'update',
                            'version': '3.0.0',
                            'currentVersion': '2.0.0',
                            'text': 'Update test',
                            'hint': 'Current: 2.0.0 | Latest: 3.0.0',
                            'status': {
                                'update': true,
                                'updating': false,
                                'updated': false,
                                'error': null
                            }
                        },
                        {
                            'id': 'updating',
                            'version': '3.0.0',
                            'currentVersion': '2.0.0',
                            'text': 'Updating test',
                            'hint': 'Current: 2.0.0 | Latest: 3.0.0',
                            'status': {
                                'update': true,
                                'updating': true,
                                'updated': false,
                                'error': null
                            }
                        },
                        {
                            'id': 'updated',
                            'version': '3.0.0',
                            'currentVersion': '2.0.0',
                            'text': 'Updated test',
                            'hint': 'Current: 2.0.0 | Latest: 3.0.0',
                            'status': {
                                'update': true,
                                'updating': true,
                                'updated': true,
                                'error': null
                            }
                        },
                        {
                            'id': 'error',
                            'version': '3.0.0',
                            'currentVersion': '2.0.0',
                            'text': 'Error test',
                            'hint': 'Current: 2.0.0 | Latest: 3.0.0',
                            'status': {
                                'update': true,
                                'updating': true,
                                'updated': false,
                                'error': 'Failed to update.'
                            }
                        }
                    ],
                    'haveUpdates': true
                });
            }
        }
    }
</script>
