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
        <div slot="footer" class="bd-installModalFooter">
            <div class="bd-button bd-ok" @click="modal.confirm(0); modal.close();">Upload</div>
            <div class="bd-button bd-ok" @click="modal.confirm(); modal.close();">Install</div>
        </div>
    </Modal>
</template>
<script>
    // Imports
    import { Modal, MiExtension } from '../../common';

    export default {
        data() {
            return {
                installing: false
            }
        },
        props: ['modal'],
        components: {
            Modal, MiExtension
        }
    }
</script>
