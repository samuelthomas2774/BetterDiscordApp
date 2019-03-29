
// Try requiring a module that this plugin is allowed to use
require('path');

// Try requiring a module that this plugin isn't allowed to use
require('v8');

module.exports = (Plugin, Api, Vendor) => {

    return class extends Plugin {
        onStart() {
            return true;
        }

        onStop() {
            return true;
        }
    }
}
