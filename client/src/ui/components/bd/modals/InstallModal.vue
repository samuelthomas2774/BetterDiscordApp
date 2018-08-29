<template>
    <Modal class="bd-installModal" :headertext="modal.title" :closing="modal.closing" @close="modal.close" :noheader="true">
        <div slot="body" class="bd-installModalBody">
            <div class="bd-installModalTop">
                <div class="bd-installModalIcon">
                    <div v-if="modal.config.iconEncoded" class="bd-installModalCi" :style="{backgroundImage: `url(${modal.config.iconEncoded})`}"/>
                    <MiExtension v-else/>
                </div>
                <div class="bd-installModalInfo">
                    <span>{{modal.config.info.name}} v{{modal.config.info.version.toString()}} by {{modal.config.info.authors.map(a => a.name).join(', ')}}</span>
                    <div class="bd-installModalDesc">
                        {{modal.config.info.description}}
                    </div>
                </div>
            </div>
            <div class="bd-installModalBottom">
                <div v-for="(perm, i) in modal.config.permissions" :key="`perm-${i}`" class="bd-permScope">
                    <div class="bd-permAllow">
                        <div class="bd-permCheck">
                            <div class="bd-permCheckInner"></div>
                        </div>
                        <div class="bd-permInner">
                            <div class="bd-permName">{{perm.HEADER}}</div>
                            <div class="bd-permDesc">{{perm.BODY}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="verifying" slot="footer" class="bd-installModalFooter">
            <span class="bd-installModalStatus">Verifying {{this.modal.contentType}}</span>
        </div>
        <div v-else-if="alreadyInstalled && upToDate" slot="footer" class="bd-installModalFooter">
            <span class="bd-installModalStatus">Up to date version already installed!</span>
        </div>
        <div v-else slot="footer" class="bd-installModalFooter">
            <div class="bd-button bd-ok" @click="modal.confirm(0); modal.close();">Upload</div>
            <div class="bd-button bd-ok" @click="modal.confirm(); modal.close();">{{ !alreadyInstalled ? 'Install' : 'Update' }}</div>
        </div>
    </Modal>
</template>
<script>
    // Imports
    import { Modal, MiExtension } from '../../common';
    import { PluginManager, ThemeManager } from 'modules';

    export default {
        data() {
            return {
                installing: false,
                verifying: true,
                alreadyInstalled: false,
                upToDate: true
            }
        },
        props: ['modal'],
        components: {
            Modal, MiExtension
        },
        mounted() {
            const { contentType, config } = this.modal;
            const alreadyInstalled = contentType === 'plugin' ? PluginManager.getPluginById(config.info.id) : ThemeManager.getContentById(config.info.id);

            if (alreadyInstalled) {
                this.alreadyInstalled = true;
                if (config.version > alreadyInstalled.version) {
                    this.upDoDate = false;
                }
            }

            // TODO Verify
            setTimeout(() => {
                this.verifying = false;
            }, 2000);

        }
    }
</script>
