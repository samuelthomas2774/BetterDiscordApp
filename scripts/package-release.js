const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const hashfiles = require('hash-files');

const releaseStub = require('./releasestub.json');

const mainpkg = require('../package.json');
const corepkg = require('../release/core/package.json');
const clientpkg = require('../release/client/package.json');
// const editorpkg = require('../release/editor/package.json');

const createArchiver = (level = 1) => {
    return archiver('tar', {
        gzip: true,
        gzipOptions: {
            level
        }
    });
};

async function hashFile(fn) {
    return new Promise((resolve, reject) => {
        hashfiles({ files: [fn], algorithm: 'sha256' }, (error, hash) => {
            if (error) return reject();
            resolve(hash);
        });
    });
}

async function fileSize(fn) {
    return new Promise((resolve, reject) => {
        fs.stat(fn, (err, stats) => {
            if (err) return reject();
            resolve(stats['size']);
        });
    });
}

// Core
async function archiveCore(out = './release/core.tar.gz') {
    return new Promise((resolve, reject) => {
        console.log('packaging core');
        const mainFn = `core.${corepkg.version}.js`;
        const coreArchive = createArchiver();
        coreArchive.file('./release/core/package.json', { name: 'package.json' });
        coreArchive.file('./release/core/index.js', { name: 'index.js' });
        coreArchive.file(`./release/core/${mainFn}`, { name: `${mainFn}` });
        coreArchive.file('./release/core/sparkplug.js', { name: 'sparkplug.js' });
        coreArchive.directory('./release/core/modules', 'modules');
        coreArchive.directory('./release/core/node_modules', 'node_modules');

        const coreZipStream = fs.createWriteStream(out);
        coreArchive.pipe(coreZipStream);

        coreArchive.on('end', () => resolve(out));
        coreArchive.on('error', reject);
        coreArchive.finalize();
    });
}

// Client
async function archiveClient(out = './release/client.tar.gz') {
    return new Promise((resolve, reject) => {
        console.log('packaging client');
        const mainFn = `client.${clientpkg.version}.js`;
        const clientArchive = createArchiver();
        clientArchive.file('./release/client/package.json', { name: 'package.json' });
        clientArchive.file('./release/core/sparkplug.js', { name: 'sparkplug.js' });
        clientArchive.file(`./release/client/${mainFn}`, { name: `${mainFn}` });

        const clientZipStream = fs.createWriteStream(out);
        clientArchive.pipe(clientZipStream);

        clientArchive.on('end', () => resolve(out));
        clientArchive.on('error', reject);
        clientArchive.finalize();
    });
}

async function pack() {
    const coreArchive = await archiveCore();
    const coreHash = await hashFile(coreArchive);
    const coreSize = await fileSize(coreArchive);
    console.log(`${coreArchive} ${coreSize} | ${coreHash}`);

    const coreStub = releaseStub.files.find(f => f.id === 'core');
    coreStub.name = 'core.tar.gz';
    coreStub.version = corepkg.version;
    coreStub.hash = coreHash;
    coreStub.size = coreSize;
    coreStub.remote = coreStub.remote.replace(':fn', 'core.tar.gz');

    const clientArchive = await archiveClient();
    const clientHash = await hashFile(clientArchive);
    const clientSize = await fileSize(clientArchive);
    console.log(`${clientArchive} ${clientSize} | ${clientHash}`);

    const clientStub = releaseStub.files.find(f => f.id === 'client');
    clientStub.name = 'client.tar.gz';
    clientStub.version = clientpkg.version;
    clientStub.hash = clientHash;
    clientStub.size = clientSize;
    clientStub.remote = clientStub.remote.replace(':fn', 'client.tar.gz');

    releaseStub.mver = mainpkg.version;
    releaseStub.files = [
        coreStub,
        clientStub
    ];

    fs.writeFile('./release/releaseinfo.json', JSON.stringify(releaseStub, null, 4), (err) => {
        console.log(`all done! Don't forget to update :rel`);
    });
}

pack();
