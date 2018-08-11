/**
 * BetterDiscord E2EE Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-e2eeTaContainer">
        <div v-if="error" class="bd-e2eeTaBtn bd-e2eeLock bd-error">
            <MiLock v-tooltip="error" />
        </div>
        <div v-else-if="state === 'loading'" class="bd-e2eeTaBtn bd-e2eeLock bd-loading bd-warn">
            <MiLock v-tooltip="'Loading'" />
        </div>
        <div v-else-if="!E2EE.encryptNewMessages" class="bd-e2eeTaBtn bd-e2eeLock bd-warn" @click="E2EE.encryptNewMessages = true">
            <MiLock v-tooltip="'New messages will not be encrypted.'" />
        </div>
        <div v-else class="bd-e2eeTaBtn bd-e2eeLock bd-ok" @click="E2EE.encryptNewMessages = false">
            <MiLock v-tooltip="'Ready!'" />
        </div>

        <div class="bd-taDivider"></div>
        <div class="bd-e2eeTaBtn bd-e2eeUploadBtn" :class="{'bd-disabled': error}" @click="showUploadDialog">
            <MiPlus v-tooltip="'Upload Encrypted'" />
        </div>
    </div>
</template>

<script>
    import fs from 'fs';
    import { remote } from 'electron';
    import { E2EE } from 'builtin';
    import { DiscordApi, Security } from 'modules';
    import { MiLock, MiPlus } from '../ui/components/common/MaterialIcon';

    const lock = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 32, 0, 0, 0, 32, 8, 4, 0, 0, 0, 217, 115, 178, 127, 0, 0, 0, 4, 103, 65, 77, 65, 0, 0, 177, 143, 11, 252, 97, 5, 0, 0, 0, 32, 99, 72, 82, 77, 0, 0, 122, 38, 0, 0, 128, 132, 0, 0, 250, 0, 0, 0, 128, 232, 0, 0, 117, 48, 0, 0, 234, 96, 0, 0, 58, 152, 0, 0, 23, 112, 156, 186, 81, 60, 0, 0, 0, 2, 98, 75, 71, 68, 0, 0, 170, 141, 35, 50, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 13, 215, 0, 0, 13, 215, 1, 66, 40, 155, 120, 0, 0, 0, 7, 116, 73, 77, 69, 7, 226, 8, 11, 6, 2, 48, 96, 75, 242, 117, 0, 0, 1, 117, 73, 68, 65, 84, 72, 199, 173, 213, 61, 75, 92, 65, 20, 198, 241, 159, 113, 13, 98, 4, 139, 192, 18, 180, 13, 18, 155, 84, 146, 8, 166, 75, 165, 164, 216, 70, 240, 43, 88, 199, 94, 44, 44, 211, 111, 229, 103, 16, 12, 249, 4, 75, 138, 93, 69, 76, 101, 145, 198, 194, 16, 133, 20, 194, 238, 54, 162, 39, 141, 108, 238, 234, 220, 151, 93, 115, 6, 134, 195, 156, 231, 249, 51, 247, 206, 153, 123, 39, 228, 197, 91, 13, 203, 150, 113, 228, 200, 129, 31, 70, 136, 41, 187, 110, 68, 102, 220, 216, 53, 85, 213, 62, 231, 100, 96, 60, 119, 62, 200, 79, 204, 85, 3, 236, 11, 161, 111, 91, 29, 212, 109, 235, 11, 97, 191, 138, 125, 93, 8, 87, 22, 135, 86, 23, 93, 9, 97, 189, 28, 208, 18, 194, 198, 163, 245, 13, 33, 180, 202, 236, 147, 122, 194, 105, 178, 118, 42, 244, 76, 14, 47, 62, 123, 32, 90, 50, 131, 118, 18, 208, 198, 140, 165, 98, 192, 27, 112, 150, 4, 156, 101, 20, 185, 128, 26, 184, 77, 2, 110, 51, 138, 92, 192, 200, 241, 100, 192, 240, 134, 102, 173, 128, 143, 166, 19, 218, 85, 176, 226, 171, 110, 26, 214, 112, 61, 212, 255, 121, 227, 90, 35, 13, 104, 87, 178, 135, 200, 30, 243, 196, 32, 155, 119, 129, 150, 47, 37, 15, 253, 217, 7, 44, 248, 245, 240, 29, 60, 7, 23, 14, 74, 0, 155, 25, 245, 255, 56, 133, 98, 192, 154, 67, 135, 214, 138, 36, 181, 130, 218, 59, 223, 192, 39, 239, 115, 110, 71, 201, 14, 182, 18, 217, 72, 128, 187, 68, 54, 18, 160, 121, 223, 113, 93, 205, 241, 0, 29, 59, 96, 71, 103, 60, 0, 253, 204, 60, 22, 160, 147, 153, 115, 162, 86, 8, 56, 182, 138, 227, 241, 1, 124, 47, 169, 63, 189, 149, 255, 221, 198, 23, 126, 155, 245, 199, 207, 18, 199, 107, 47, 117, 189, 210, 123, 92, 106, 86, 254, 30, 228, 244, 69, 221, 158, 203, 82, 243, 165, 189, 251, 127, 38, 248, 11, 109, 255, 171, 183, 250, 206, 128, 34, 0, 0, 0, 37, 116, 69, 88, 116, 100, 97, 116, 101, 58, 99, 114, 101, 97, 116, 101, 0, 50, 48, 49, 56, 45, 48, 56, 45, 49, 49, 84, 48, 54, 58, 48, 50, 58, 52, 56, 43, 48, 50, 58, 48, 48, 90, 233, 185, 110, 0, 0, 0, 37, 116, 69, 88, 116, 100, 97, 116, 101, 58, 109, 111, 100, 105, 102, 121, 0, 50, 48, 49, 56, 45, 48, 56, 45, 49, 49, 84, 48, 54, 58, 48, 50, 58, 52, 56, 43, 48, 50, 58, 48, 48, 43, 180, 1, 210, 0, 0, 0, 25, 116, 69, 88, 116, 83, 111, 102, 116, 119, 97, 114, 101, 0, 119, 119, 119, 46, 105, 110, 107, 115, 99, 97, 112, 101, 46, 111, 114, 103, 155, 238, 60, 26, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);

    export default {
        components: { MiLock, MiPlus },
        data() {
            return {
                E2EE,
                state: 'loading',
                error: null
            };
        },
        methods: {
            showUploadDialog() {
                const dialogResult = remote.dialog.showOpenDialog({ properties: ['openFile'] });
                if (!dialogResult) return;
                console.log(dialogResult);
                const readFile = fs.readFileSync(dialogResult[0]);
                console.log(readFile);
                const merge = new Uint8Array([...lock, ...readFile]);
                const FileActions = _bd.WebpackModules.getModuleByProps(["makeFile"]);
                const Uploader = _bd.WebpackModules.getModuleByProps(["instantBatchUpload"]);
                const file = FileActions.makeFile(merge, "encrypted.png");
                console.log(file);
                Uploader.upload(DiscordApi.currentChannel.id, FileActions.makeFile(merge, "bde2ee_266x200.png"));
            }
        },
        mounted() {
            if (!E2EE.master) {
                this.error = 'No master key set!';
                return;
            }
            const haveKey = E2EE.getKey(DiscordApi.currentChannel.id);
            if (!haveKey) {
                this.error = 'No key for channel!';
                return;
            }
            this.state = 'OK';
            this.error = null;
        }
    }
</script>
