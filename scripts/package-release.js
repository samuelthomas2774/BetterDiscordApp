const args = process.argv;
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const hashfiles = require('hash-files');

const releaseStub = require('./releasestub.json');
const mainpkg = require('../package.json');
const corepkg = require('../release/core/package.json');
const clientpkg = require('../release/client/package.json');
const editorpkg = require('../release/editor/package.json');

const tag = args.length > 2 ? args[2] : mainpkg.version;

releaseStub.files = releaseStub.files.map(file => {
    file.remote = file.remote.replace(':rel', tag);
    return file;
});

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
        const coreArchive = createArchiver(6);
        coreArchive.file('./release/core/package.json', { name: 'core/package.json' });
        coreArchive.file('./release/core/index.js', { name: 'core/index.js' });
        coreArchive.file(`./release/core/${mainFn}`, { name: `core/${mainFn}` });
        coreArchive.file('./release/core/csp.json', { name: 'core/csp.json' });
        coreArchive.file('./release/core/sparkplug.js', { name: 'core/sparkplug.js' });
        coreArchive.directory('./release/core/modules', 'core/modules');
        coreArchive.directory('./release/core/node_modules', 'core/node_modules');

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
        clientArchive.file('./release/client/package.json', { name: 'client/package.json' });
        clientArchive.file('./release/core/sparkplug.js', { name: 'client/sparkplug.js' });
        clientArchive.file(`./release/client/${mainFn}`, { name: `client/${mainFn}` });

        const clientZipStream = fs.createWriteStream(out);
        clientArchive.pipe(clientZipStream);

        clientArchive.on('end', () => resolve(out));
        clientArchive.on('error', reject);
        clientArchive.finalize();
    });
}

// Editor
async function archiveEditor(out = './release/editor.tar.gz') {
    return new Promise((resolve, reject) => {
        console.log('packaging editor');
        const mainFn = `editor.${editorpkg.version}.js`;
        const editorArchive = createArchiver();
        editorArchive.directory('./release/editor', 'editor');

        const editorZipStream = fs.createWriteStream(out);
        editorArchive.pipe(editorZipStream);

        editorArchive.on('end', () => resolve(out));
        editorArchive.on('error', reject);
        editorArchive.finalize();
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

    const editorArchive = await archiveEditor();
    const editorHash = await hashFile(editorArchive);
    const editorSize = await fileSize(editorArchive);
    console.log(`${editorArchive} ${editorSize} | ${editorHash}`);

    const editorStub = releaseStub.files.find(f => f.id === 'editor');
    editorStub.name = 'editor.tar.gz';
    editorStub.version = editorpkg.version;
    editorStub.hash = editorHash;
    editorStub.size = editorSize;
    editorStub.remote = editorStub.remote.replace(':fn', 'editor.tar.gz');

    releaseStub.mver = mainpkg.version;
    releaseStub.files = [
        releaseStub.files.find(f => f.id === 'stub'),
        coreStub,
        clientStub,
        editorStub
    ];

    fs.writeFile('./release/releaseinfo.json', JSON.stringify(releaseStub, null, 4), (err) => {
        console.log(`all done! ${tag === ':rel' ? `Don't forget to update :rel` : ''}`);
    });
}

pack();
