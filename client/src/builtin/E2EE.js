/**
 * BetterDiscord E2EE Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BuiltinModule from './BuiltinModule';
import { WebpackModules, ReactComponents, MonkeyPatch, Patcher } from 'modules';
import { VueInjector, Reflection } from 'ui';
import E2EEComponent from './E2EEComponent.vue';
import aes256 from 'aes256';
import crypto from 'crypto';

export default new class E2EE extends BuiltinModule {

    get settingPath() {
        return ['security', 'default', 'e2ee'];
    }

    async enabled(e) {
        const ctaComponent = await ReactComponents.getComponent('ChannelTextArea');
        MonkeyPatch('BD:E2EE', ctaComponent.component.prototype).after('render', this.render);
        MonkeyPatch('BD:E2EE', ctaComponent.component.prototype).before('handleSubmit', this.handleSubmit);
    }

    render(component, args, retVal) {
        if (!(retVal.props.children instanceof Array)) retVal.props.children = [retVal.props.children];
        const inner = retVal.props.children.find(child => child.props.className && child.props.className.includes('inner'));

        inner.props.children.splice(0, 0, VueInjector.createReactElement(E2EEComponent, {}, true));
    }

    handleSubmit(component, args, retVal) {
        component.props.value = aes256.encrypt('randomkey', component.props.value);
    }
    
    get ecdh() {
        if (!this._ecdh) this._ecdh = {};
        return this._ecdh;
    }

    createKeyExchange(userID) {
        this.ecdh[userID] = crypto.createECDH('secp521r1');
        return this.ecdh[userID].generateKeys('base64');
    }

    publicKeyFor(userID) {
        return this.ecdh[userID].getPublicKey('base64');
    }

    computeSecret(userID, otherKey) {
        const secret = this.ecdh[userID].computeSecret(otherKey, 'base64', 'base64');
        delete this.ecdh[userID];
        // Hashing the shared secret future-proofs against some possible attacks.
        const hash = crypto.createHash('sha256');
        hash.update(secret);
        return hash.digest('base64');
    }

    disabled(e) {
        for (const patch of Patcher.getPatchesByCaller('BD:E2EE')) patch.unpatch();
    }

}
