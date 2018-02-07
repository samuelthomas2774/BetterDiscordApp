<template>
    <div class="bd-modals-container">
        <div v-for="(modal, index) in modals" :key="`bd-modal-${index}`">
            <div v-if="index === 0" class="bd-backdrop" @click="closeModal(index)"></div>
            <div v-else :style="{opacity: 0}" class="bd-backdrop" @click="closeModal(index)"></div>
            <Modal :headerText="modal.header" 
                   :close="() => closeModal(index)" 
                   :class="[{'bd-err': modal.type && modal.type === 'err'}, {'bd-modal-out': modal.closing}]">
                    <MiError v-if="modal.type === 'err'" slot="icon"/>
            </Modal>
        </div>
    </div>
</template>
<script>
    // Imports
    import { Events } from 'modules';
    import { Modal } from '../common';
    import { MiError } from '../common/MaterialIcon';

    export default {
        data() {
            return {
                modals: []
            }
        },
        components: {
            Modal, MiError
        },
        beforeMount() {
            Events.on('bd-error', e => {
                e.closing = false;
                this.modals.push(e);
            });
        },
        methods: {
            closeModal(index) {
                this.modals[index].closing = true;
                setTimeout(() => {
                    this.modals.splice(index, 1);
                }, 200);
            }
        }
    }
</script>
