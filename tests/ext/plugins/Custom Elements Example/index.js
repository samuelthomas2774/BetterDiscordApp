/**
 * This is an example of how you should add custom elements instead of manipulating the DOM directly
 */

module.exports = (Plugin, Api, Vendor) => {

    // Destructure some apis
    const { Logger, ReactComponents, Patcher, monkeyPatch, Reflection, Utils, CssUtils, VueInjector } = Api;
    const { Vue } = Vendor;
    const { React } = Reflection.modules; // This should be in vendor

    return class extends Plugin {

        async onStart() {
            Logger.log('Custom Elements Example Started');
            this.injectStyle();
            this.patchGuildTextChannel();
            return true;
        }

        async onStop() {
            Logger.log('Custom Elements Example Stopped');
            // The automatic unpatcher is not there yet
            Patcher.unpatchAll();
            CssUtils.deleteAllStyles();

            // Force update elements to remove our changes
            const GuildTextChannel = await ReactComponents.getComponent('GuildTextChannel');
            GuildTextChannel.forceUpdateAll();
            return true;
        }

        /* Inject some style for our custom element */
        async injectStyle() {
            const css = `
                .exampleCustomElement {
                    background: #7a7d82;
                    color: #FFF;
                    border-radius: 5px;
                    font-size: 12px;
                    font-weight: 600;
                    opacity: .5;
                    &:hover {
                        opacity: 1;
                    }
                }`;
            await CssUtils.injectSass(css);
        }

        async patchGuildTextChannel() {
            // Get the GuildTextChannel component and patch it's render function
            const GuildTextChannel = await ReactComponents.getComponent('GuildTextChannel');
            monkeyPatch(GuildTextChannel.component.prototype).after('render', this.injectReact.bind(this));
            // Force update to see our changes immediatly
            GuildTextChannel.forceUpdateAll();
        }

        /* Injecting a custom Vue element */
        injectVue() {
            // TODO
        }

        /*
         * Injecting a custom React element using React.createElement
         * https://reactjs.org/docs/react-api.html#createelement
         **/
        injectReact(that, args, returnValue) {
            // Get the child we want using a treewalker since we know the child we want has a channel property and children.
            const child = Utils.findInReactTree(returnValue, filter => filter.hasOwnProperty('channel') && filter.children);
            if (!child) return;
            // If children is not an array make it into one
            if (!child.children instanceof Array) child.children = [child.children];

            // Create custom components
            const reactComponent = React.createElement(
                'button',
                { className: 'exampleCustomElement', onClick: e => this.handleClick(e, child.channel) },
                'r'
            );

            // Using Vue might be preferred to some
            const vueComponent = Vue.component('somecomponent', {
                render: createElement => {
                    return createElement('button', {
                        class: 'exampleCustomElement',
                        on: {
                            click: e => this.handleClick(e, child.channel)
                        }
                    }, 'v')
                }
            });

            // Add our custom components to children
            child.children.push(reactComponent);
            child.children.push(VueInjector.createReactElement(vueComponent)); // We need to wrap our vue component inside react
        }

        /**
         * Will log the channel object
         */
        handleClick(e, channel) {
            Logger.log('Clicked!', channel);
        }
    }

};
