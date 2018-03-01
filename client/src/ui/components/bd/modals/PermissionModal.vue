/**
 * BetterDiscord Permission Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <Modal :class="['bd-modal-basic', {'bd-modal-out': modal.closing}]" :headerText="modal.title" :close="modal.close">
        <div slot="body" class="bd-modal-basic-body">
            <div v-for="(perm, i) in permissions" :key="`perm-${i}`" class="bd-perm-scope">
                <div class="bd-perm-allow">
                    <div class="bd-perm-check">
                        <div class="bd-perm-check-inner"></div>
                    </div>
                    <div class="bd-perm-inner">
                        <div class="bd-perm-name">{{perm.HEADER}}</div>
                        <div class="bd-perm-desc">{{perm.BODY}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div slot="footer" class="bd-modal-controls">
            <div class="bd-flex-grow"></div>
            <div class="bd-button" @click="modal.close">Cancel</div>
            <div class="bd-button bd-ok" @click="() => { modal.confirm(); modal.close(); }">Authorize</div>
        </div>
    </Modal>
</template>

<script>
    // Imports
    import { Modal } from '../../common';
    import { Permissions } from 'modules';

    export default {
        data() {
            return { permissions: [] }
        },
        props: ['modal'],
        components: {
            Modal
        },
        beforeMount() {
            this.permissions = this.modal.perms.map(perm => {
                const getPerm = Permissions.permissionText(perm);
                getPerm.BODY = getPerm.BODY.replace(':NAME:', this.modal.name);
                return getPerm;
            });
        }
    }
</script>
