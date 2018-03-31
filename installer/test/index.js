const { ipcMain, app, BrowserWindow } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const unzipStream = require('unzip-stream');
const GitHub = require('github-api');
const github = new GitHub();

github.getLatestRelease = async function (user, repo) {
    try {
        const get = await this.getRepo(user, repo).getRelease('latest');
        return get.data;
    } catch (err) {
        throw err;
    }
};

async function unzipStreamAsync(data, path) {
    return new Promise((resolve, reject) => {
        try {
            data.pipe(unzipStream.Extract({ path })).on('close', resolve);
        } catch (err) {
            reject(err);
        }
    });
}

async function install(paths, channel, dataPath, appendLog) {
    const discordPath = paths[channel].latest;
    const bdPath = dataPath;

    appendLog(`Installing to: ${discordPath}`);
    appendLog(`with BetterDiscord path: ${bdPath}`);

    appendLog('Fetching release info');
    const release = await github.getLatestRelease('JsSucks', 'BetterDiscordApp');

    appendLog(`Using release: ${release.id}, version ${release.tag_name}`);
    const pkg = release.assets.find(asset => asset.name === 'full.zip');
    if (!pkg)
        throw {message: 'Release does not contain full package! Unable to continue.'};

    appendLog(`Using release asset: ${pkg.id}`);
    appendLog('Downloading asset...');
    const dl = await axios({
        url: pkg.url,
        method: 'GET',
        headers: { 'Accept': 'application/octet-stream' },
        responseType: 'stream'
    });

    appendLog('Unpacking asset...');
    const unzip = await unzipStreamAsync(dl.data, bdPath);

    appendLog('Verifying assets');
}

ipcMain.on('install', async (e, args) => {
    function appendLog(message) {
        e.sender.send('appendlog', message);
    }

    try {
        const { paths, channel, dataPath } = args;
        await install(paths, channel, dataPath, appendLog);
    } catch (err) {
        appendLog(err.message);
    }

    e.sender.send('installdone');
});

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
