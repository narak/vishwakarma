
var logger = require('./logger'),
    regedFiles = {},
    File = {};

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
    logger.out('Changed:', this.file);
    logger.debug(this);
};

File.register = function(name) {
    var file = regedFiles[name];
    if (!file) {
        regedFiles[name] = file = new FileClass(name);
    }
    return file;
};

File.getByName = function(name) {
    return regedFiles[name];
};

module.exports = File;
