const process = require('process');
const child_process = require('child_process');

switch (process.platform) {
    case 'darwin':
    case 'linux':
        child_process.execSync(`scripts/build-node-sass-${process.platform}.sh`, {
            stdio: 'inherit'
        });
        break;
    case 'win32':
        child_process.execSync(`scripts/build-node-sass-win32.bat`, {
            stdio: 'inherit'
        });
        break;
    default:
        console.log(`Unknown platform ${process.platform}`);
        process.exit(1);
}
