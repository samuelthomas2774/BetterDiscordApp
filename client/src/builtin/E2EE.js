/**
 * BetterDiscord E2EE Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Settings } from 'modules';
import BuiltinModule from './BuiltinModule';
import { WebpackModules, ReactComponents, MonkeyPatch, Patcher, DiscordApi } from 'modules';
import { VueInjector, Reflection } from 'ui';
import E2EEComponent from './E2EEComponent.vue';
import aes256 from 'aes256';

let seed = Math.random().toString(36).replace(/[^a-z]+/g, '');

export default new class E2EE extends BuiltinModule {

    constructor() {
        super();
        this.master = this.encrypt(seed, 'temporarymasterkey');
    }

    setMaster(key) {
        seed = Math.random().toString(36).replace(/[^a-z]+/g, '');
        this.master = this.encrypt(seed, key);
    }

    get settingPath() {
        return ['security', 'default', 'e2ee'];
    }

    get database() {
        return Settings.getSet('security').settings.find(s => s.id === 'e2eedb').settings[0].value;
    }

    encrypt(key, content, prefix = '$:') {
        return prefix + aes256.encrypt(key, content);
    }

    decrypt(key, content, prefix = '$:') {
        return aes256.decrypt(key, content.substr(2));
    }

    getKey(channelId) {
        const haveKey = this.database.find(kvp => kvp.value.key === channelId);
        if (!haveKey) return null;
        return haveKey.value.value;
    }

    async enabled(e) {
        const ctaComponent = await ReactComponents.getComponent('ChannelTextArea');
        MonkeyPatch('BD:E2EE', ctaComponent.component.prototype).after('render', this.render);
        MonkeyPatch('BD:E2EE', ctaComponent.component.prototype).before('handleSubmit', this.handleSubmit.bind(this));
    }

    render(component, args, retVal) {
        if (!(retVal.props.children instanceof Array)) retVal.props.children = [retVal.props.children];
        const inner = retVal.props.children.find(child => child.props.className && child.props.className.includes('inner'));

        inner.props.children.splice(0, 0, VueInjector.createReactElement(E2EEComponent, {}, true));
    }

    handleSubmit(component, args, retVal) {
        const key = this.getKey(DiscordApi.currentChannel.id);
        if (!key) return;
        component.props.value = this.encrypt(this.decrypt(this.decrypt(seed, this.master), key), component.props.value);
    }

    disabled(e) {
        for (const patch of Patcher.getPatchesByCaller('BD:E2EE')) patch.unpatch();
    }

}
