module.exports = (Plugin, Api, Vendor) => {

    const { ReactComponents } = Api;

    return class extends Plugin {
        test() {
            
        }
        onStart() {
            this.patchMessage();
            return true;
        }
        async patchMessage() {
            const Message = await ReactComponents.getComponent('Message');
            this.unpatchTest = Api.MonkeyPatch(Message.component.prototype).after('render', () => {
                console.log('MESSAGE RENDER!');
            });
        }

        onStop() {
            this.unpatchTest(); // The automatic unpatcher is not there yet
            return true;
        }
    }
}

