import Vue from 'vue';
import App from './app.vue';

import styles from './styles/index.scss';

const instance = new Vue({
    el: '#app',
    components: { App },
    template: `<App platform="${process.platform}"/>`
});

const style = document.createElement('style');
style.id = 'bd-main';
style.type = 'text/css';
style.appendChild(document.createTextNode(styles));
document.head.appendChild(style);
