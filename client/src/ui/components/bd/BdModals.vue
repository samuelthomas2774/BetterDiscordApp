/**
 * BetterDiscord Modals Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-modals-container">
        <div v-for="(modal, index) in modals.stack" :key="`bd-modal-${modal.id}`">
            <div class="bd-backdrop" :class="{'bd-backdrop-out': closing}" :style="{opacity: index === 0 ? undefined : 0}"></div>
            <div class="bd-modal-wrap" :style="{transform: `scale(${downscale(index + 1, 0.2)})`, opacity: downscale(index + 1, 1)}">
                <div class="bd-modal-close-area" @click="closeModal(modal)"></div>
                <keep-alive><component :is="modal.component" /></keep-alive>
            </div>
        </div>
    </div>
</template>
<script>
    // Imports
    import { Events } from 'modules';
    import { Modals } from 'ui';
    import { Modal } from '../common';
    import { MiError } from '../common/MaterialIcon';
    import ErrorModal from './modals/ErrorModal.vue';

    export default {
        components: {
            Modal, MiError
        },
        data() {
            return {
                modals: Modals,
                eventListener: null
            };
        },
        computed: {
            closing() {
                return !this.modals.stack.find(m => !m.closing);
            }
        },
        created() {
            Events.on('bd-refresh-modals', this.eventListener = () => {
                this.$forceUpdate();
            });
        },
        destroyed() {
            if (this.eventListener) Events.off('bd-refresh-modals', this.eventListener);
        },
        methods: {
            closeModal(modal) {
                modal.close();
            },
            downscale(index, times) {
                return 1 - ((this.modals.stack.filter(m => !m.closing).length - index) * times);
            }
        }
    }
</script>
