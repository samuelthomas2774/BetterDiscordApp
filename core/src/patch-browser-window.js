

const electron = require('electron');
const path = require('path');

const _BrowserWindow = electron.BrowserWindow;

console.log('Open windows:', _BrowserWindow.getAllWindows());
console.log('Open window URLs:', _BrowserWindow.getAllWindows().map(w => w.getURL()));

console.log('Patching BrowserWindow');

class PatchedBrowserWindow extends _BrowserWindow {
    constructor(originalOptions) {
        const options = Object.assign({}, originalOptions);
        options.webPreferences = Object.assign({}, options.webPreferences);

        options.webPreferences.nodeIntegration = true;

        console.log('Creating new BrowserWindow with options', options, originalOptions);
        return new _BrowserWindow(options);
    }
};

// Can't just do this because electron.BrowserWindow is a getter
// electron.BrowserWindow = PatchedBrowserWindow;

// Can't do this either because it's not configurable because ^^
// Object.defineProperty(electron, 'BrowserWindow', {
//     get: () => PatchedBrowserWindow
// });

console.log('Electron:', electron);

console.log('Electron BrowserWindow getter:', electron.__lookupGetter__('BrowserWindow'));
console.log('Electron BrowserWindow setter:', electron.__lookupSetter__('BrowserWindow'));

const electron_path = require.resolve('electron');
const electron_module = require.cache[electron_path];
console.log('Electron module path:', electron_path);
console.log('Electron module:', electron_module);

const browser_window_path = require.resolve(path.resolve(electron_path, '..', '..', 'browser-window.js'));
const browser_window_module = require.cache[browser_window_path];
console.log('BrowserWindow module path:', browser_window_path);
console.log('BrowserWindow module:', browser_window_module);

browser_window_module.exports = PatchedBrowserWindow;

try {
    new (require("../../../../BetterDiscord")).BetterDiscord();
} catch (err) {
    console.err('Error loading BetterDiscord:', err);
}

// Main window is created here
module.exports = require('./core');
