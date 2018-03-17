import Vue from 'vue';
import App from './app.vue';

const mount = document.createElement('div');
document.body.appendChild(mount);

const instance = new Vue({
    el: mount,
    components: { App },
    template: '<App/>'
});
