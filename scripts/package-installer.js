const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const releasepkg = require('../installer/package.json');

const installer_name = 'BetterDiscord Installer';
const installer_path = path.resolve(__dirname, '..', 'installer', installer_name);
const readme_path = path.resolve(__dirname, '..', 'README.md');
const license_path = path.resolve(__dirname, '..', 'LICENSE');
const output_path = path.resolve(__dirname, '..', 'installer');

// installer-darwin-x64.zip
const darwin_x64 = new Promise((resolve, reject) => {
    const archive = archiver('zip');
    archive.file(readme_path, {name: 'README.md'});
    archive.file(license_path, {name: 'license.txt'});
    archive.file(`${installer_path}-darwin-x64/LICENSE`, {name: 'electron-license.txt'});
    archive.file(`${installer_path}-darwin-x64/LICENSES.chromium.html`, {name: 'chromium-license.html'});
    archive.directory(`${installer_path}-darwin-x64/${installer_name}.app`, `${installer_name}.app`);

    const archive_stream = fs.createWriteStream(path.join(output_path, 'installer-darwin-x64.zip'));
    archive.pipe(archive_stream);

    archive.on('end', resolve);
    archive.on('error', reject);
    archive.finalize();
});

// installer-linux-x64.zip
const linux_x64 = new Promise((resolve, reject) => {
    const archive = archiver('zip');
    archive.file(readme_path, {name: 'README.md'});
    archive.file(path.resolve(__dirname, '..', 'installer', 'linux-start.desktop'), {name: 'Install BetterDiscord.desktop', mode: 0755});
    archive.file(license_path, {name: 'license.txt'});
    archive.file(`${installer_path}-linux-x64/LICENSE`, {name: 'electron-license.txt'});
    archive.file(`${installer_path}-linux-x64/LICENSES.chromium.html`, {name: 'chromium-license.html'});
    archive.directory(`${installer_path}-linux-x64`, installer_name);

    const archive_stream = fs.createWriteStream(path.join(output_path, 'installer-linux-x64.zip'));
    archive.pipe(archive_stream);

    archive.on('end', resolve);
    archive.on('error', reject);
    archive.finalize();
});

// installer-win32-ia32.zip
const win32_ia32 = new Promise((resolve, reject) => {
    const archive = archiver('zip');
    archive.file(readme_path, {name: 'README.md'});
    archive.file(path.resolve(__dirname, '..', 'installer', 'windows-start.bat'), {name: 'Install BetterDiscord.bat'});
    archive.file(license_path, {name: 'license.txt'});
    archive.file(`${installer_path}-win32-ia32/LICENSE`, {name: 'electron-license.txt'});
    archive.file(`${installer_path}-win32-ia32/LICENSES.chromium.html`, {name: 'chromium-license.html'});
    archive.directory(`${installer_path}-win32-ia32`, installer_name);

    const archive_stream = fs.createWriteStream(path.join(output_path, 'installer-win32-ia32.zip'));
    archive.pipe(archive_stream);

    archive.on('end', resolve);
    archive.on('error', reject);
    archive.finalize();
});
