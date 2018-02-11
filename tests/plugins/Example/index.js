module.exports = (Plugin, Api, Vendor) => {

    const { $, moment, _ } = Vendor;
    const { Events, Logger } = Api;
    return class extends Plugin {

        onStart() {
            Events.subscribe('TEST_EVENT', this.eventTest);
            Logger.log('onStart');
            return true;
        }

        onStop() {
            Events.unsubscribeAll();
            Logger.log('onStop');
            return true;
        }

        eventTest(e) {
            Logger.log(e);
        }
    }

}