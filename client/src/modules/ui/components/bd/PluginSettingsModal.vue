<template src="./templates/PluginSettingsModal.html"></template>
<script>
    /*Imports*/
    import { Modal } from '../generic';
    const components = { Modal };

    /*Methods*/
    function textInputKd(e) {
        console.log(e);
        this.changed = true;
    }
    const methods = { textInputKd };

    export default {
        props: ['plugin'],
        data() {
            return {
                'changed': false
            }
        },
        components,
        methods
    }
</script>

<style>
    .bd-modal-inner {
        position: relative;
    }

    .bd-modal-footer .footer-alert {
        opacity: 0;
        transform: translateY(100%);
        height: 30px;
        display: flex;
        background: rgba(32, 34, 37, 0.9);
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        box-shadow: 0 2px 10px 0 rgba(0,0,0,.2);
        padding: 10px 10px 10px 16px;
        border-radius: 5px;
        transition: all .3s ease-in-out;
    }

    .bd-modal-footer .footer-alert.bd-active {
        opacity: 1;
        transform: none;
    }

    .bd-modal-footer .footer-alert .footer-alert-text {
        color: #FFF;
        flex: 1 1 auto;
        font-weight: 500;
    }

    .bd-modal-footer .footer-alert {
        height: 30px;
        color: #FFF;
    }

        .bd-modal-footer .footer-alert .footer-alert-text {
            line-height: 30px;
        }

        .bd-modal-footer .footer-alert .bd-button {
            width: 120px;
            border-radius: 3px;
        }

        .bd-modal-footer .footer-alert .bd-reset-button {
            height: 30px;
            line-height: 30px;
            margin-right: 10px;
        }
</style>