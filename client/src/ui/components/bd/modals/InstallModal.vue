<template>
    <Modal class="bd-installModal" :headertext="modal.title" :closing="modal.closing" @close="modal.close" :noheader="true" :class="{'bd-err': !verifying && !verified, 'bd-installModalDone': installed, 'bd-installModalFail': err}">
        <template v-if="!installed && !err">
            <div slot="body" class="bd-installModalBody">
                <div class="bd-installModalTop">
                    <div class="bd-installModalIcon">
                        <div v-if="modal.icon" class="bd-installModalCi" :style="{backgroundImage: `url(${modal.icon})`}" />
                        <MiExtension v-else />
                    </div>
                    <div class="bd-installModalInfo">
                        <span>{{modal.config.info.name}} v{{modal.config.info.version}} by {{modal.config.info.authors.map(a => a.name).join(', ')}}</span>
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
                <span class="bd-installModalStatus">Verifying {{modal.contentType}}</span>
            </div>
            <div v-else-if="!verified" slot="footer" class="bd-installModalFooter">
                <span class="bd-installModalStatus bd-err">Not verified!</span>
                <div class="bd-button bd-installModalUpload" @click="modal.confirm(0); modal.close();">Upload</div>
                <div class="bd-button bd-err" @click="install" v-if="allowUnsafe">{{ !alreadyInstalled ? 'Install' : 'Update' }}</div>
            </div>
            <div v-else-if="alreadyInstalled && upToDate" slot="footer" class="bd-installModalFooter">
                <span class="bd-installModalStatus">Up to date version already installed!</span>
                <div class="bd-button bd-installModalUpload" @click="modal.confirm(0); modal.close();">Upload</div>
            </div>
            <div v-else slot="footer" class="bd-installModalFooter">
                <span class="bd-installModalStatus bd-ok">Verified!</span>
                <div class="bd-button bd-installModalUpload" @click="modal.confirm(0); modal.close();">Upload</div>
                <div class="bd-button bd-ok" @click="install">{{ !alreadyInstalled ? 'Install' : 'Update' }}</div>
            </div>
        </template>
        <template v-else-if="err">
            <div slot="body" class="bd-installModalBody">
                <h3>Something went wrong :(</h3>
                <MiError />
            </div>
            <div slot="footer" class="bd-installModalFooter bd-installModalErrMsg">
                {{err.message}}
                <span>Ctrl+Shift+I</span>
            </div>
        </template>
        <template v-else>
            <div slot="body" class="bd-installModalBody">
                <h3>{{alreadyInstalled ? 'Succesfully Updated!' : 'Successfully Installed!'}}</h3>
                <MiSuccessCircle/>
            </div>
            <div slot="footer" class="bd-installModalFooter">
                <div class="bd-button bd-ok" v-if="installed.hasSettings" @click="showSettingsModal">Settings</div>
                <div class="bd-button bd-ok" @click="modal.confirm(); modal.close();">OK</div>
            </div>
        </template>
    </Modal>
</template>
<script>
    // Imports
    import { Modal, MiExtension, MiSuccessCircle, MiError } from '../../common';
    import { PluginManager, ThemeManager, PackageInstaller, Settings } from 'modules';

    export default {
        data() {
            return {
                installing: false,
                verifying: true,
                alreadyInstalled: false,
                upToDate: true,
                allowUnsafe: Settings.getSetting('security', 'default', 'unsafe-content').value,
                installed: false,
                err: null
            }
        },
        props: ['modal'],
        components: {
            Modal, MiExtension, MiSuccessCircle, MiError
        },
        mounted() {
            const { contentType, config } = this.modal;
            const alreadyInstalled = contentType === 'plugin' ? PluginManager.getPluginById(config.info.id) : ThemeManager.getContentById(config.info.id);

            if (alreadyInstalled) {
                this.alreadyInstalled = true;
                if (config.info.version > alreadyInstalled.version) {
                    this.upToDate = false;
                }
            }
            this.verify();
        },
        methods: {
            async verify() {
                const verified = await PackageInstaller.verifyPackage(this.modal.filePath);
                this.verified = verified;
                this.verifying = false;
            },
            async install() {
                try {
                    const installed = await PackageInstaller.installPackage(this.modal.filePath, this.modal.config.info.id || this.modal.config.info.name, this.modal.contentType, this.alreadyInstalled);
                    this.installed = installed;
                } catch (err) {
                    console.log(err);
                    this.err = err;
                }
            },
            showSettingsModal() {
                this.installed.showSettingsModal();
            }
        }
    }
</script>
