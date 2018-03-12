import Patcher from './patcher';

class Helpers {
    static get plannedActions() {
        return this._plannedActions || (this._plannedActions = new Map());
    }
    static recursiveArray(parent, key, count = 1) {
        let index = 0;
        function* innerCall(parent, key) {
            const item = parent[key];
            if (item instanceof Array) {
                for (const subKey of item.keys()) {
                    yield* innerCall(item, subKey)
                }
                return;
            }
            yield { item, parent, key, index: index++, count };
        }

        return innerCall(parent, key);
    }
    static recursiveArrayCount(parent, key) {
        let count = 0;
        for (let { } of this.recursiveArray(parent, key))
            ++count;
        return this.recursiveArray(parent, key, count);
    }
    static get recursiveChildren() {
        return function*(parent, key, index = 0, count = 1) {
            const item = parent[key];
            yield { item, parent, key, index, count };
            if (item && item.props && item.props.children) {
                for (let { parent, key, index, count } of this.recursiveArrayCount(item.props, 'children')) {
                    yield* this.recursiveChildren(parent, key, index, count);
                }
            }
        }
    }
    static returnFirst(iterator, process) {
        for (let child of iterator) {
            const retVal = process(child);
            if (retVal !== undefined) return retVal;
        }
    }
    static getFirstChild(rootParent, rootKey, selector) {
        const getDirectChild = (item, selector) => {
            if (item && item.props && item.props.children) {
                return this.returnFirst(this.recursiveArrayCount(item.props, 'children'), checkFilter.bind(null, selector));
            }
        };
        const checkFilter = (selector, { item, parent, key, count, index }) => {
            let match = true;
            if (match && selector.type)
                match = item && selector.type === item.type;
            if (match && selector.tag)
                match = item && typeof item.type === 'string' && selector.tag === item.type;
            if (match && selector.className) {
                match = item && item.props && typeof item.props.className === 'string';
                if (match) {
                    const classes = item.props.className.split(' ');
                    if (selector.className === true)
                        match = !!classes[0];
                    else if (typeof selector.className === 'string')
                        match = classes.includes(selector.className);
                    else if (selector.className instanceof RegExp)
                        match = !!classes.find(cls => selector.className.test(cls));
                    else match = false;
                }
            }
            if (match && selector.text) {
                if (selector.text === true)
                    match = typeof item === 'string';
                else if (typeof selector.text === 'string')
                    match = item === selector.text;
                else if (selector.text instanceof RegExp)
                    match = typeof item === 'string' && selector.text.test(item);
                else match = false;
            }
            if (match && selector.nthChild)
                match = index === (selector.nthChild < 0 ? count + selector.nthChild : selector.nthChild);
            if (match && selector.hasChild)
                match = getDirectChild(item, selector.hasChild);
            if (match && selector.hasSuccessor)
                match = item && !!this.getFirstChild(parent, key, selector.hasSuccessor).item;
            if (match && selector.eq) {
                --selector.eq;
                return;
            }
            if (match) {
                if (selector.child) {
                    return getDirectChild(item, selector.child);
                }
                else if (selector.successor) {
                    return this.getFirstChild(parent, key, selector.successor);
                }
                else {
                    return { item, parent, key };
                }
            }
        };
        return this.returnFirst(this.recursiveChildren(rootParent, rootKey), checkFilter.bind(null, selector)) || {};
    }
    static parseSelector(selector) {
        if (selector.startsWith('.')) return { className: selector.substr(1) }
        if (selector.startsWith('#')) return { id: selector.substr(1) }
        return {}
    }
}

class ReactComponent {
    constructor(id, component, retVal) {
        this._id = id;
        this._component = component;
        this._retVal = retVal;
    }

    get id() {
        return this._id;
    }

    get component() {
        return this._component;
    }

    get retVal() {
        return this._retVal;
    }

    unpatchRender() {
        
    }

    patchRender(actions, updateOthers) {
        const self = this;
        if (!(actions instanceof Array)) actions = [actions];
        Patcher.slavepatch(this.component.prototype, 'render', function(args, obj) {
            for (const action of actions) {
                let { selector, method, fn } = action;
                if ('string' === typeof selector) selector = Helpers.parseSelector(selector);
                const { item, parent, key } = Helpers.getFirstChild(obj, 'retVal', selector);
                if (!item) continue;
                const content = fn.apply(this, [item]);
                switch (method) {
                    case 'replace':
                        parent[key] = content;
                        break;
                }
            }
            if (updateOthers) self.forceUpdateOthers();
        });
    }

    forceUpdateOthers() {

    }
}

export default class ReactComponents {
    static get components() { return this._components || (this._components = []) }
    static get listeners() { return this._listeners || (this._listeners = []) }

    static push(component, retVal) {
        if (!(component instanceof Function)) return null;
        const { displayName } = component;
        if (!displayName) return null;
        const have = this.components.find(comp => comp.id === displayName);
        if (have) return component;
        const c = new ReactComponent(displayName, component, retVal);
        this.components.push(c);
        const listener = this.listeners.find(listener => listener.id === displayName);
        if (!listener) return c;
        for (const l of listener.listeners) {
            l(c);
        }
        this.listeners.splice(this.listeners.findIndex(listener => listener.id === displayName), 1);
        return c;
    }

    static async getComponent(name) {
        const have = this.components.find(c => c.id === name);
        if (have) return have;
        const listener = this.listeners.find(l => l.id === name);
        if (!listener) this.listeners.push({
            id: name,
            listeners: []
        });
        return new Promise(resolve => {
            this.listeners.find(l => l.id === name).listeners.push(c => resolve(c));
        });
    }

}
