const { ipcMain, app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const util = require('util');
const axios = require('axios');
const unzipStream = require('unzip-stream');
const GitHub = require('github-api');
const github = new GitHub();

const readFile = (...args) => new Promise((resolve, reject) => fs.readFile(...args, (err, data) => err ? reject(err) : resolve(data)));
const writeFile = (...args) => new Promise((resolve, reject) => fs.writeFile(...args, (err, data) => err ? reject(err) : resolve(data)));

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

    appendLog(`Using release ${release.id}, version ${release.tag_name}`);
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

    appendLog(`Unpacking core...`);
    await unzipStreamAsync(fs.createReadStream(path.join(bdPath, 'core.zip')), bdPath);

    appendLog(`Unpacking client bundle...`);
    await unzipStreamAsync(fs.createReadStream(path.join(bdPath, 'client.zip')), bdPath);

    appendLog(`Unpacking CSS editor bundle...`);
    await unzipStreamAsync(fs.createReadStream(path.join(bdPath, 'csseditor.zip')), bdPath);

    appendLog('Verifying assets');
    // TODO: check everything was downloaded and unpacked properly

    appendLog('Injecting loader into Discord');
    const discord_desktop_core_path = path.join(discordPath, 'modules', 'discord_desktop_core');

    appendLog('Writing new discord_desktop_core/index.js');

    const relativeBdPath = bdPath.startsWith(process.env.HOME) ? path.relative(discord_desktop_core_path, bdPath) : bdPath;
    const escapedPath = relativeBdPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    await writeFile(path.join(discord_desktop_core_path, 'index.js'), `try {
        new (require("${escapedPath}")).BetterDiscord();
    } catch (err) {
        console.err('Error loading BetterDiscord:', err);
    }
    module.exports = require('./core.asar');
    `);

    appendLog('Done!');
}

ipcMain.on('install', async (e, args) => {
    function appendLog(message) {
        console.log('Install progress:', message);
        e.sender.send('appendlog', message);
    }

    try {
        const { paths, channel, dataPath } = args;
        await install(paths, channel, dataPath, appendLog);

        e.sender.send('installdone');
    } catch (err) {
        appendLog(err.message);
        e.sender.send('installerror', err);
    }
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
