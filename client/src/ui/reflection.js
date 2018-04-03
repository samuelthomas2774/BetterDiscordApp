/**
 * BetterDiscord Reflection Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ClientLogger as Logger } from 'common';

class Reflection {
    static reactInternalInstance(node) {
        if (!node) return null;
        if (!Object.keys(node) || !Object.keys(node).length) return null;
        const riiKey = Object.keys(node).find(k => k.startsWith('__reactInternalInstance'));
        return riiKey ? node[riiKey] : null;
    }

    static findProp(node, prop) {
        const ii = this.reactInternalInstance(node);
        if (!ii) return null;
        const fir = this.findInReturn(ii, prop);
        if (fir) return fir;
        const fim = this.findInChildProps(ii, prop);
        if (fim) return fim;
        return null;
    }

    static findInReturn(internalInstance, prop) {
        const r = internalInstance.return;
        if (!r) return null;
        let find = this.findMemoizedProp(r, prop);
        if (find) return find;
        find = this.findMemoizedState(r, prop);
        if (find) return find;
        return this.findInReturn(r, prop);
    }

    static findMemoizedProp(obj, prop) {
        if (!obj.hasOwnProperty('memoizedProps')) return null;
        obj = obj.memoizedProps;
        return this.findPropIn(obj, prop);
    }

    static findMemoizedState(obj, prop) {
        if (!obj.hasOwnProperty('memoizedState')) return null;
        obj = obj.memoizedState;
        return this.findPropIn(obj, prop);
    }

    static findInChildProps(obj, prop) {
        try {
            const f = obj.children || obj.memoizedProps.children;
            if (!f.props) return null;
            if (!f.props.hasOwnProperty(prop)) return null;
            return f.props[prop];
        } catch (err) {
            return null;
        }
    }

    static findPropIn(obj, prop) {
        if (obj && !(obj instanceof Array) && obj instanceof Object && obj.hasOwnProperty(prop)) return obj[prop];
        if (obj && obj instanceof Array) {
            const found = obj.find(mp => {
                if (mp.props && mp.props.hasOwnProperty(prop)) return true;
            });
            if (found) return found;
        }
        return null;
    }

    static propIterator(obj, propNames) {
        if (obj === null || obj === undefined) return null;
        const curPropName = propNames.shift(1);
        if (!obj.hasOwnProperty(curPropName)) return null;
        const curProp = obj[curPropName];
        if (propNames.length === 0) {
            return curProp;
        }
        return this.propIterator(curProp, propNames);
    }

    static getState(node) {
        try {
            return this.reactInternalInstance(node).return.stateNode.state;
        } catch (err) {
            return null;
        }
    }

    static getStateNode(node) {
        try {
            return this.reactInternalInstance(node).return.stateNode;
        } catch (err) {
            return null;
        }
    }

    static getComponent(node, first = true) {
        // IMPORTANT TODO Currently only checks the first found component. For example channel-member will not return the correct component
        try {
            return this.reactInternalInstance(node).return.type;
        } catch (err) {
            return null;
        }
        /*
        if (!node) return null;
        if (first) node = this.reactInternalInstance(node);
        if (node.hasOwnProperty('return')) {
            if (node.return.hasOwnProperty('return') && !node.return.type) return node.type;
            return this.getComponent(node.return, false);
        }
        if (node.hasOwnProperty('type')) return node.type;
        return null;
        */
    }
}

export default function (node) {
    return new class {
        constructor(node) {
            if ('string' === typeof node) node = document.querySelector(node);
            this.node = this.el = this.element = node;
        }
        get props() {
            return 'not yet implemented';
        }
        get state() {
            return Reflection.getState(this.node);
        }
        get stateNode() {
            return Reflection.getStateNode(this.node);
        }
        get reactInternalInstance() {
            return Reflection.reactInternalInstance(this.node);
        }
        get component() {
            return Reflection.getComponent(this.node);
        }
        forceUpdate() {
            try {
                const stateNode = Reflection.getStateNode(this.node);
                if (!stateNode || !stateNode.forceUpdate) return;
                stateNode.forceUpdate();
            } catch (err) {
                Logger.err('Reflection', err);
            }
        }
        prop(propName) {
            const split = propName.split('.');
            const first = Reflection.findProp(this.node, split[0]);
            if (split.length === 1) return first;
            return Reflection.propIterator(first, split.slice(1));
        }
    }(node);
}
