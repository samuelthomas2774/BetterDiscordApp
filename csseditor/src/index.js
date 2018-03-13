/**
 * BetterDiscord CSS Editor
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Vue from 'vue';
import VueCodemirror from 'vue-codemirror';

import Editor from './Editor.vue';
import styles from './styles/index.scss';

Vue.use(VueCodemirror, {});

window.cmCommands = VueCodemirror.CodeMirror.commands;

const mount = document.createElement('div');
mount.classList.add('container');
document.body.appendChild(mount);

const vue = new Vue({
    el: mount,
    components: { Editor },
    template: '<Editor/>'
});

const style = document.createElement('style');
style.id = 'bd-main';
style.type = 'text/css';
style.appendChild(document.createTextNode(styles));
document.head.appendChild(style);
