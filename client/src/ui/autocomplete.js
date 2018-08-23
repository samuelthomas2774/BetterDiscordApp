import { Settings, Globals, WebpackModules, ReactComponents, MonkeyPatch, Cache } from 'modules';
import { VueInjector } from 'ui';

import AutocompleteComponent from './components/common/Autocomplete.vue';
import { Utils } from 'common';

export default new class Autocomplete {

    get sets() {
        return this._sets || (this._sets = new Map());
    }

    async init() {
        this.cta = await ReactComponents.getComponent('ChannelTextArea', { selector: WebpackModules.getSelector('channelTextArea', 'emojiButton') });
        MonkeyPatch('BD:Autocomplete', this.cta.component.prototype).after('render', this.channelTextAreaAfterRender.bind(this));
        this.initialized = true;
    }

    get latestComponent() {
        return this._latestComponent;
    }

    channelTextAreaAfterRender(component, args, retVal) {
        const inner = Utils.findInReactTree(retVal, filter => filter && filter.className && filter.className.includes('inner'));

        if (!inner || !inner.children) return;
        inner.children.splice(0, 0, VueInjector.createReactElement(AutocompleteComponent, {
            controller: this,
            _insertText: component.insertText.bind(component)
        }));
    }

    add(prefix, controller) {
        if (!this.initialized) this.init();
        if (this.validPrefix(prefix)) return;
        this.sets.set(prefix, controller);
    }

    remove(prefix) {
        this.sets.delete(prefix);
    }

    validPrefix(prefix) {
        return this.sets.has(prefix);
    }

    toggle(prefix, sterm, event) {
        const controller = this.sets.get(prefix);
        return controller && controller.toggle && controller.toggle(sterm, event);
    }

    items(prefix, sterm) {
        if (!this.validPrefix(prefix)) return [];
        return this.sets.get(prefix).acsearch(sterm);
    }

}
