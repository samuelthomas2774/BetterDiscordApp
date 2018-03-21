const { ipcMain, app, BrowserWindow } = require('electron');
const path = require('path');
const axios = require('axios'), fs = require('fs'), unzipStream = require('unzip-stream');
const github = require('github-api');
const Github = new github();
Github.getLatestRelease = async function (user, repo) {
    try {
        const get = await this.getRepo(user, repo).getRelease('latest');
        return get.data;
    } catch (err) {
        throw err;
    }
}

async function unzipStreamAsync(data, path) {
    return new Promise((resolve, reject) => {
        try {
            data.pipe(unzipStream.Extract({ path })).on('close', resolve);
        } catch (err) {
            reject(err);
        }
    });
}

async function install(e, args) {
    function finish() {
        e.sender.send('installdone');
    }
    function appendLog(message) {
        e.sender.send('appendlog', message);
    }
    try {

        const { paths, dataPath, channel } = args;

        const discordPath = paths[channel].latest.replace(/\\/g, '/');
        const bdPath = dataPath.replace(/\\/g, '/');

        appendLog(`Installing to: ${discordPath}`);
        appendLog(`with BetterDiscord path: ${bdPath}`);

        appendLog('Fetching release info');

        const release = await Github.getLatestRelease('JsSucks', 'BetterDiscordApp');

        appendLog(`Using release: ${release.id}`);
        const pkg = release.assets.find(asset => asset.name === 'full.zip');
        if (!pkg) {
            appendLog('Release does not contain full package! Unable to continue');
            finish();
            return;
        }
        appendLog(`Using release asset: ${pkg.id}`);
        appendLog('Downloading asset...');

        const dl = await axios({
            url: pkg.url,
            method: 'GET',
            headers: { 'Accept': 'application/octet-stream' },
            responseType: 'stream'
        });

        const unzip = await unzipStreamAsync(dl.data, bdPath);

        appendLog('Verifying assets');

    } catch (err) {
        appendLog(err.message);
        finish();
        return;
    }
}

ipcMain.on('install', install);


app.on('window-all-closed', () => {
    app.quit();
});

const devMode = true;
const options = {
    width: 800,
    height: 400,
    fullscreenable: false,
    maximizable: false,
    frame: false,
    resizable: devMode ? true : false,
    // alwaysOnTop: devMode ? true : false,
    backgroundColor: '#101013',
    transparent: false
};

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow(options);
    mainWindow.loadURL(`file://${path.resolve(__dirname, '..', 'dist', 'index.html')}`);
});
