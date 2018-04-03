<template>
    <Modal :headerText="modal.event.header" @close="modal.close"
           :class="[{'bd-err': modal.event.type && modal.event.type === 'err'}, {'bd-modal-out': modal.closing}]">
        <MiError v-if="modal.event.type === 'err'" slot="icon" size="20"/>
        <div slot="body">
            <div v-for="(content, index) in modal.event.content">
                <div class="bd-modal-error" :class="{'bd-open': content.showStack}">
                    <div class="bd-modal-error-title bd-flex">
                        <span class="bd-modal-title-text bd-flex-grow">{{content.message}}</span>
                        <span class="bd-modal-titlelink" v-if="content.showStack" @click="() => { content.showStack = false; $forceUpdate(); }">Hide Stacktrace</span>
                        <span class="bd-modal-titlelink" v-else @click="() => { content.showStack = true; $forceUpdate(); }">Show Stacktrace</span>
                    </div>
                    <div class="bd-scroller-wrap">
                        <div class="bd-scroller">
                            <div class="bd-modal-error-body"><span>{{content.err.message}}</span>
                            {{content.stackTrace}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div slot="footer" class="bd-modal-controls">
            <span class="bd-modal-tip">Press {{ platformInspectorKey }} for more details</span>
            <div class="bd-button bd-ok" @click="modal.close">OK</div>
        </div>
    </Modal>
</template>

<script>
    // Imports
    import { Modal } from '../../common';
    import { MiError } from '../../common/MaterialIcon';

    const process = window.require('process');

    export default {
        props: ['modal'],
        components: {
            Modal, MiError
        },
        computed: {
            platformInspectorKey() {
                return process.platform === 'darwin' ? 'Cmd+Option+I' : 'Ctrl+Shift+I';
            }
        }
    }
</script>
