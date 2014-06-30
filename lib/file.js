
var fs = require('fs'),
    logger = require('./logger'),
    Module = require('./module'),
    path = require('path'),
    regedFiles = {};

var FileClass = function(file) {
    logger.info('Registered file:', file);
    this.file = file;
    this._builds = [];
    this._partOf = [];
    this._depsFor = [];
    this._prependFor = [];
}

FileClass.prototype.builds = function(name) {
    logger.debug(this.file, 'builds', name);
    this._builds.push(name);
};

FileClass.prototype.partOf = function(name) {
    logger.debug(this.file, 'partOf', name);
    this._partOf.push(name);
};

FileClass.prototype.depsFor = function(name) {
    logger.debug(this.file, 'depsFor', name);
    this._depsFor.push(name);
};

FileClass.prototype.prependFor = function(name) {
    logger.debug(this.file, 'prependFor', name);
    this._prependFor.push(name);
};

FileClass.prototype.changed = function() {
    logger.info('Changed:', this.file);

    if (this._builds.length) {
        this.updateBuilds();
        Module.build(this._builds);
    }
    if (this._depsFor.length) {
        this.updateDeps();
        Module.build(this._depsFor);
    }

    Module.build(this._prependFor);
    Module.build(this._partOf);
};

FileClass.prototype.updateBuilds = function(cb) {
    var self = this,
        dirname = path.dirname(self.file);
    self._builds = [];
    fs.readFile(self.file, 'utf8', function(err, data) {
        if (err) {
            logger.error(err);
            return;
        }

        var parsed, builds, modName, mod;
        try {
            parsed = JSON.parse(data);
            builds = parsed.builds;
            for (var modName in builds) {
                self.builds(modName);
                mod = Module.register(modName);
                mod.modDir(dirname);
                mod.config(builds[modName]);
            }
            cb && cb();
        } catch (e) {
            logger.error('Error while updating builds from:', self.file);
            logger.error(e);
            logger.error(e.stack);
        }
    });
};

FileClass.prototype.updateDeps = function(cb) {
    var self = this;
    self._depsFor = [];
    fs.readFile(self.file, 'utf8', function(err, data) {
        if (err) {
            logger.error(err);
            return;
        }

        var modules = [],
            submodules = {},
            parsed, key, modName, mod;
        try {
            parsed = JSON.parse(data);
            for (key in parsed) {
                for (modName in parsed[key].submodules) {
                    submodules[modName] = parsed[key].submodules[modName];
                }
            }
            for (modName in submodules) {
                self.depsFor(modName);
                mod = Module.register(modName);
                mod.dependencies(submodules[modName].requires);
            }
            cb && cb();
        } catch (e) {
            logger.error('Error while updating deps from:', self.file);
            logger.error(e);
            logger.error(e.stack);
        }
    });
};

exports.register = function(name) {
    var file = regedFiles[name];
    if (!file) {
        regedFiles[name] = file = new FileClass(name);
    }
    return file;
};

exports.getByName = function(name) {
    return regedFiles[name];
};
