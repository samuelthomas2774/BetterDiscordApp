const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const releasepkg = require('../release/package.json');
const mainpkg = require('../package.json');
const corepkg = require('../core/package.json');
const clientpkg = require('../client/package.json');
const editorpkg = require('../csseditor/package.json');

// core.zip
const core = new Promise((resolve, reject) => {
    const core_zip = archiver('zip');
    core_zip.file('./release/package.json', {name: 'package.json'});
    core_zip.file('./release/index.js', {name: 'index.js'});
    core_zip.file(`./release/core.${corepkg.version}.js`, {name: `core.${corepkg.version}.js`});
    core_zip.file('./release/sparkplug.js', {name: 'sparkplug.js'});
    core_zip.directory('./release/modules', 'modules');
    core_zip.directory('./release/node_modules', 'node_modules');

    const core_zip_stream = fs.createWriteStream('./release/core.zip');
    core_zip.pipe(core_zip_stream);

    core_zip.on('end', resolve);
    core_zip.on('error', reject);
    core_zip.finalize();
});

// client.zip
const client = new Promise((resolve, reject) => {
    const client_zip = archiver('zip');
    client_zip.file(`./release/client.${clientpkg.version}.js`, {name: `client.${clientpkg.version}.js`});

    const client_zip_stream = fs.createWriteStream('./release/client.zip');
    client_zip.pipe(client_zip_stream);

    client_zip.on('end', resolve);
    client_zip.on('error', reject);
    client_zip.finalize();
});

// csseditor.zip
const csseditor = new Promise((resolve, reject) => {
    const csseditor_zip = archiver('zip');
    csseditor_zip.directory('./release/csseditor', 'csseditor');

    const csseditor_zip_stream = fs.createWriteStream('./release/csseditor.zip');
    csseditor_zip.pipe(csseditor_zip_stream);

    csseditor_zip.on('end', resolve);
    csseditor_zip.on('error', reject);
    csseditor_zip.finalize();
});

// full.zip
Promise.all([core, client, csseditor]).then(() => {
    const full_zip = archiver('zip');
    full_zip.file('./release/core.zip', {name: 'core.zip'});
    full_zip.file('./release/client.zip', {name: 'client.zip'});
    full_zip.file('./release/csseditor.zip', {name: 'csseditor.zip'});

    const full_zip_stream = fs.createWriteStream('./release/full.zip');
    full_zip.pipe(full_zip_stream);
    full_zip.finalize();
});
