const keytar_version = require('keytar/package').version;

module.exports = require(`./keytar-${keytar_version}/${process.platform}-${process.arch}-${process.versions.modules}.node`);
