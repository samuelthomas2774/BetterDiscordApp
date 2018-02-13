module.exports = (Plugin, Api, Vendor) => {

    const { $, moment } = Vendor;
    const { Events, Logger } = Api;

    return class extends Plugin {
        async onstart() {
            const example_plugin = await Api.bridge('example-plugin');
            console.log('Example plugin exports:', example_plugin.test1());
        }

        async onstop() {
            const example_plugin = await Api.bridge('example-plugin');
            console.log('Example plugin exports:', example_plugin.test2());
        }
    }

};
