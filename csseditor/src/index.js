const styles = require('./styles/index.scss');

import Vue from 'vue';
import Editor from './Editor.vue';
import VueCodemirror from 'vue-codemirror'

Vue.use(VueCodemirror, {});

window.cmCommands = VueCodemirror.CodeMirror.commands;

new Vue({
    el: '#root',
    template: '<Editor/>',
    components: { Editor }
});

const style = document.createElement('style');
style.id = 'bd-main';
style.type = 'text/css';
style.appendChild(document.createTextNode(styles));
document.head.appendChild(style);
