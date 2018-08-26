import VrWrapper from '../../vrwrapper';

import ButtonGroupComponent from './ButtonGroup.vue';
class ButtonGroupWrapper extends VrWrapper {
    get component() { return ButtonGroupComponent }
    constructor(props) {
        super();
        this.props = props;
    }
}

import ButtonComponent from './Button.vue';
class ButtonWrapper extends VrWrapper {
    get component() { return ButtonComponent }
    constructor(props) {
        super();
        this.props = props;
    }
}

export default class {
    static Button(props) {
        return new ButtonWrapper(props);
    }

    static ButtonGroup(props) {
        return new ButtonGroupWrapper(props);
    }
}
