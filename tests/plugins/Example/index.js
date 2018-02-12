module.exports = (Plugin, Api, Vendor) => {

    const { $, moment, _ } = Vendor;
    const { Events, Logger } = Api;

    return class extends Plugin {
        onStart() {
            Events.subscribe('TEST_EVENT', this.eventTest);
            Logger.log('onStart');
            Logger.log(`Setting "default-0" value: ${this.getSetting('default-0')}`);
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

        settingChanged(category, setting_id, value) {
            if (!this.enabled) return;
            Logger.log(`${category}/${setting_id} changed to ${value}`);
        }

        settingsChanged(settings) {
            if (!this.enabled) return;
            Logger.log([ 'Settings updated', settings ]);
        }
    }

}
