
var logger = require('./logger'),
    regedFiles = {},
    File = {};

var FileClass = function(file) {
    this.file = file;
    this._builds = [];
    this._partOf = [];
    this._depsFor = [];
    this._prependFor = [];
}
FileClass.prototype.builds = function(name) {
    this._builds.push(name);
};
FileClass.prototype.partOf = function(name) {
    this._partOf.push(name);
};
FileClass.prototype.depsFor = function(name) {
    this._depsFor.push(name);
};
FileClass.prototype.prependFor = function(name) {
    this._prependFor.push(name);
};
FileClass.prototype.changed = function() {
    // Loop through all props and call appropriate changes.
};

File.getByName = function(name) {
    var file = regedFiles[name];
    if (!file) {
        regedFiles[name] = file = new FileClass(name);
    }
    return file;
}

module.exports = File;
