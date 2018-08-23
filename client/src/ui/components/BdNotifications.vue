/**
 * BetterDiscord Notifications Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-notifications">
        <div v-if="notifications.length" class="bd-notificationContainer bd-flex bd-flexCol bd-active" :class="{'bd-closing': dismissing}">
            <div class="bd-notificationHeader bd-flex">
                <div @click="this.dismissFirst" class="bd-notificationDismissBtn"><MiArrowLeft size="20"/></div>
            </div>
            <div class="bd-notificationBody bd-flex">
                <div v-if="notifications[0].title" class="bd-notificationTitle">{{notifications[0].title}}</div>
                <div class="bd-notificationText">{{notifications[0].text}}</div>
            </div>
            <div class="bd-notificationFooter bd-flex">
                <div class="bd-notificationBtn" v-for="(btn, index) in notifications[0].buttons" @click="() => buttonHandler(index)">
                    {{btn.text}}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    // Imports
    import { Notifications } from 'ui';
    import { MiArrowLeft } from './common';

    export default {
        data() {
            return {
                notifications: Notifications.stack,
                dismissing: false
            };
        },
        components: { MiArrowLeft },
        methods: {
            dismissFirst() {
                if (this.dismissing) return;
                this.dismissing = true;
                setTimeout(() => {
                    Notifications.dismiss(0);
                    this.dismissing = false;
                }, 500);
            },
            buttonHandler(index) {
                if (!this.notifications[0].buttons[index].onClick) return;
                if (this.notifications[0].buttons[index].onClick()) {
                    this.dismissing = true;
                    setTimeout(() => {
                        Notifications.dismiss(0);
                        this.dismissing = false;
                    }, 500);
                }
            }
        }
    }
</script>
