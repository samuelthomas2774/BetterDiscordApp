/**
 * BetterDiscord Client UI Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DOM from './dom';
import Vue from './vue';
import { BdSettingsWrapper } from './components';
import BdModals from './components/bd/BdModals.vue';
import { Events, WebpackModules } from 'modules';
import { Utils } from 'common';
import AutoManip from './automanip';
import { remote } from 'electron';

class TempApi {
    static get currentGuild() {
        try {
            const currentGuildId = WebpackModules.getModuleByName('SelectedGuildStore').getGuildId();
            return WebpackModules.getModuleByName('GuildStore').getGuild(currentGuildId);
        } catch (err) {
            return null;
        }
    }
    static get currentChannel() {
        try {
            const currentChannelId = WebpackModules.getModuleByName('SelectedChannelStore').getChannelId();
            return WebpackModules.getModuleByName('ChannelStore').getChannel(currentChannelId);
        } catch (err) {
            return 0;
        }
    }
    static get currentUserId() {
        try {
            return WebpackModules.getModuleByName('UserStore').getCurrentUser().id;
        } catch (err) {
            return 0;
        }
    }
}

export default class {

    static initUiEvents() {
        this.pathCache = {
            isDm: null,
            server: TempApi.currentGuild,
            channel: TempApi.currentChannel
        };
        window.addEventListener('keyup', e => Events.emit('gkh:keyup', e));
        this.autoManip = new AutoManip();
        const defer = setInterval(() => {
            if (!this.profilePopupModule) return;
            clearInterval(defer);

            /*Utils.monkeyPatch(this.profilePopupModule, 'open', 'after', (data, userid) => Events.emit('ui-event', {
                event: 'profile-popup-open',
                data: { userid }
            }));*/
        }, 100);

        const ehookInterval = setInterval(() => {
            if (!remote.BrowserWindow.getFocusedWindow()) return;
            clearInterval(ehookInterval);
            remote.BrowserWindow.getFocusedWindow().webContents.on('did-navigate-in-page', (e, url, isMainFrame) => {
                const { currentGuild, currentChannel } = TempApi;
                if (!this.pathCache.server) {
                    Events.emit('server-switch', { 'server': currentGuild, 'channel': currentChannel });
                    this.pathCache.server = currentGuild;
                    this.pathCache.channel = currentChannel;
                    return;
                }
                if (!this.pathCache.channel) {
                    Events.emit('channel-switch', currentChannel);
                    this.pathCache.server = currentGuild;
                    this.pathCache.channel = currentChannel;
                    return;
                }
                if (currentGuild &&
                    currentGuild.id &&
                    this.pathCache.server &&
                    this.pathCache.server.id !== currentGuild.id) {
                    Events.emit('server-switch', { 'server': currentGuild, 'channel': currentChannel });
                    this.pathCache.server = currentGuild;
                    this.pathCache.channel = currentChannel;
                    return;
                }
                if (currentChannel &&
                    currentChannel.id &&
                    this.pathCache.channel &&
                    this.pathCache.channel.id !== currentChannel.id) Events.emit('channel-switch', currentChannel);


                this.pathCache.server = currentGuild;
                this.pathCache.channel = currentChannel;
            });
        }, 100);
    }

    static get profilePopupModule() {
        return WebpackModules.getModuleByProps(['fetchMutualFriends', 'setSection']);
    }

    static injectUi() {
        DOM.createElement('div', null, 'bd-settings').appendTo(DOM.bdBody);
        DOM.createElement('div', null, 'bd-modals').appendTo(DOM.bdModals);
        DOM.createElement('bd-tooltips').appendTo(DOM.bdBody);

        const modals = new Vue({
            el: '#bd-modals',
            components: { BdModals },
            template: '<BdModals/>'
        });

        const vueInstance = new Vue({
            el: '#bd-settings',
            components: { BdSettingsWrapper },
            template: '<BdSettingsWrapper/>'
        });

        return vueInstance;
    }

}
