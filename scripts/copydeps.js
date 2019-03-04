var fs = require('fs');
var path = require('path');

function getDeps(module) {
	var pkg = JSON.parse(fs.readFileSync(module.path + '/package.json'));
	return pkg.dependencies ? Object.keys(pkg.dependencies) : [];
}

function hasChildren(module) {
	try {
		fs.statSync(module.path + '/node_modules');
		return true;
	} catch(err) {
		return false;
	}
}

function locateDep(module, dep, rootnm = false) {
	var mPath = (rootnm ? '.' : module.path) + '/node_modules/' + dep;
	try {
		fs.statSync(mPath);
		return {
			name: dep,
			path: mPath
		}
	} catch(err) {
		if(!rootnm) return locateDep(module, dep, true);
		return {
			name: dep,
			path: null
		}
	}
}

function buildDependencyTree(depsRef, module) {
	if(module.name === null || module.path === null) {
		return;
	}

	try {
		fs.statSync(module.path + '/package.json');
	} catch(err) { return; }

	var deps = getDeps(module);

	for(var dep of deps) {
		var located = locateDep(module, dep);
		if(!depsRef.find(d => d.path === located.path)) {
			buildDependencyTree(depsRef, located);
			depsRef.push(located);
		}

		if(hasChildren(located)) {
			var childModules = fs.readdirSync(located.path + '/node_modules').map(name => located.path + '/node_modules/' + name).filter(source => fs.statSync(source).isDirectory());
			for(var childModule of childModules) {
				buildDependencyTree(depsRef, { name: '!child', path: childModule });
			}
		}
	}

}

module.exports = function(config) {
	var depsRef = [];

	buildDependencyTree(depsRef, {
		name: '!root',
		path: '.'
	});

	for(var dep of depsRef) {
		if(!dep.path) {
			if(!dep.name || !config.ignore.includes(dep.name)) {
				console.warn('DEPENDENCY NOT FOUND:', dep.name)
			}
		}
	}

	var flatten = depsRef.filter(d => d.path && !d.path.replace('./node_modules', '').includes('node_modules'));
	var star = flatten.map(d => d.path + '/**/*');

	console.log('Found ' + star.length + ' dependencies');
	return star;
}
