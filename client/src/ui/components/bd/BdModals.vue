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
        <div v-for="(modal, index) in modals" :key="`bd-modal-${index}`">
            <div v-if="index === 0" class="bd-backdrop" @click="closeModal(index)"></div>
            <div v-else :style="{opacity: 0}" class="bd-backdrop" @click="closeModal(index)"></div>
            <Modal :headerText="modal.header" 
                   :close="() => closeModal(index)" 
                   :class="[{'bd-err': modal.type && modal.type === 'err'}, {'bd-modal-out': modal.closing}]">
                    <MiError v-if="modal.type === 'err'" slot="icon" size="20"/>
                <div slot="body">
                    <div v-for="(content, index) in modal.content">
                        <ErrorModal v-if="content._type === 'err'" :content="content" :hideStack="hideStack" :showStack="showStack"/>
                    </div>
                </div>
                <div slot="footer" class="bd-modal-controls">
                    <span class="bd-modal-tip">Ctrl+Shift+I for more details</span>
                    <div class="bd-button bd-ok" @click="closeModal(index)">
                        OK
                    </div>
                </div>
            </Modal>
        </div>
    </div>
</template>
<script>
    // Imports
    import { Events } from 'modules';
    import { Modal } from '../common';
    import { MiError } from '../common/MaterialIcon';
    import ErrorModal from '../common/ErrorModal.vue';

    export default {
        data() {
            return {
                modals: []
            }
        },
        components: {
            Modal, MiError, ErrorModal
        },
        beforeMount() {
            Events.on('bd-error', e => {
                e.closing = false;
                this.modals.push(e);
                console.log(this.modals);
            });
        },
        methods: {
            closeModal(index) {
                this.modals[index].closing = true;
                setTimeout(() => {
                    this.modals.splice(index, 1);
                }, 200);
            },
            showStack(error) {
                error.showStack = true;
            },
            hideStack(error) {
                error.showStack = false;
            }
        }
    }
</script>
