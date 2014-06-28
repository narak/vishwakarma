
var logger = require('./logger'),
    regedModules = {},
    regedFiles = {},
    Module = {},
    File = {};

var FileClass = function(file) {
    this.file = file;
    this._builds = [];
    this._partOf = [];
    this._depsFor = [];
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

File.getByName = function(name) {
    var file = regedFiles[name];
    if (!file) {
        regedFiles[name] = file = new FileClass(name);
    }
    return file;
}

var ModuleClass = function(name) {
    this.name = name;
    logger.info('Registering:', this.name);
    return this;
};
ModuleClass.prototype.setConf = function(conf) {
    logger.info('Configuring:', this.name);
    this.conf = conf;
};
ModuleClass.prototype.setDeps = function(deps) {
    logger.info('Depending:', this.name);
    this.deps = deps;
};

Module.setConf = function(name, conf, buildCfgFile) {
    var mod = Module.getByName(name),
        file = File.getByName(buildCfgFile);
    mod.setConf(conf);
    file.builds(name);
    return mod;
};

Module.setDeps = function(name, deps, depsFile) {
    var mod = Module.getByName(name)
        file = File.getByName(depsFile);
    mod.setDeps(deps);
    file.depsFor(name);
    return mod;
};

Module.getByName = function(name) {
    var mod = regedModules[name];
    if (!mod) {
        regedModules[name] = mod = new ModuleClass(name);
    }
    return mod;
};

Module.build = function(action, file) {
    logger.info('Building:', file, action);
};

module.exports = Module;
