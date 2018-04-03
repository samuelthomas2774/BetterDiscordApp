module.exports = (Plugin, Api, Vendor) => {

    const { Logger, ReactComponents, Patcher, monkeyPatch } = Api;

    return class extends Plugin {
        onStart() {
            this.patchMessage();
            return true;
        }

        async patchMessage() {
            const Message = await ReactComponents.getComponent('Message');
            monkeyPatch(Message.component.prototype).after('render', e => {
                Logger.log('MESSAGE RENDER!', e);
            });
        }

        onStop() {
            // The automatic unpatcher is not there yet
            Patcher.unpatchAll();
            return true;
        }
    }

};
