/**
 * BetterDiscord Vue Injector Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { WebpackModules } from 'modules';
import Vue from './vue';

export default class {

    /**
     * Creates a new Vue object and mounts it in the passed element.
     * @param {HTMLElement} root The element to mount the new Vue object at
     * @param {Object} options Options to pass to Vue
     * @param {BdNode} bdnode The element to append
     * @return {Vue}
     */
    static inject(root, options, bdnode) {
        if(bdnode) bdnode.appendTo(root);

        const vue = new Vue(options);

        vue.$mount(bdnode ? bdnode.element : root);
        return vue;
    }

    /**
     * Returns a React element that will render a Vue component.
     * @param {Object} options Options to pass to Vue
     * @param {Boolean} mountAtTop Whether to mount the Vue component at the top of the React component instead of mounting it in a container
     * @return {React.Element}
     */
    static createReactElement(options, mountAtTop) {
        const React = WebpackModules.getModuleByName('React');
        return React.createElement(this.ReactCompatibility, {options, mountAtTop});
    }

    static get ReactCompatibility() {
        if (this._ReactCompatibility) return this._ReactCompatibility;

        const React = WebpackModules.getModuleByName('React');
        const ReactDOM = WebpackModules.getModuleByName('ReactDOM');

        return this._ReactCompatibility = class VueComponent extends React.Component {
            render() {
                return React.createElement('span');
            }

            componentDidMount() {
                this.vueInstance.$mount(this.vueMount);
            }

            componentDidUpdate() {
                this.vueInstance.$mount(this.vueMount);
            }

            componentWillUnmount() {
                this.vueInstance.$destroy();
                delete this._vueInstance;
            }

            get vueMount() {
                const element = ReactDOM.findDOMNode(this);
                if (!element) return;
                if (this.props.mountAtTop) return element;
                if (element.firstChild) return element.firstChild;
                const newElement = document.createElement('span');
                element.appendChild(newElement);
                return newElement;
            }

            get vueInstance() {
                return this._vueInstance || (this._vueInstance = new Vue(this.props.options));
            }
        }
    }

}
