const defaultSettings = require('../../data/user.settings.default');

class Settings {
    
    static get getSettings() {
        return defaultSettings;
    }

}

module.exports = { Settings };