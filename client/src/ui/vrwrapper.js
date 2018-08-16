/* Simple helper class for wrapping vue into react */

import VueInjector from './vueinjector';

export default class VueReactWrapper {

    render() {
        return this.reactComponent = VueInjector.createReactElement(this.component, this.props);
    }

}
