module.exports = (Plugin, Api, Vendor) => {

    const { $, moment, _ } = Vendor;
    const { Events, Logger } = Api;

    const test = 'Testing';

    return class extends Plugin {
        test() {
            return test;
        }

        onStart() {
            Logger.log('onStart');
            return true;
        }

        onStop() {
            Logger.log('onStop');
            return true;
        }
    }

}