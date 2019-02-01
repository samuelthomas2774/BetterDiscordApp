const { paths } = require('./bd.json');
const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const Module = require('module');

const packagePath = path.join(__dirname, '..', 'app.asar');
app.getAppPath = () => packagePath;

function loadBd() {
    const { BetterDiscord } = require(paths.core);
    const instance = new BetterDiscord();
}

app.on('ready', loadBd);

Module._load(app.getAppPath(), null, true);
