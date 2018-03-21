import Vue from 'vue';
import App from './ui/app.vue';

import styles from './styles/index.scss';



const instance = new Vue({
    el: '#app',
    components: { App },
    data: { platform: process.platform },
    template: `<App :platform="platform" />`
});

const style = document.createElement('style');
style.id = 'bd-main';
style.type = 'text/css';
style.appendChild(document.createTextNode(styles));
document.head.appendChild(style);
