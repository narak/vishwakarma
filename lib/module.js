
var path = require('path'),
    logger = require('./logger'),
    File = require('./file'),
    regedModules = {},
    Module = {};

var ModuleClass = function(name) {
    this.name = name;
    logger.info('Registering:', this.name);
    return this;
};
ModuleClass.prototype.setConf = function(conf) {
    logger.info('Configuring:', this.name);
    var self = this;

    if (conf.prependfiles) {
        conf.prependfiles.forEach(function(file) {
            var filePath = path.resolve(file);
            logger.debug(filePath);
        });
    }

    if (conf.jsfiles) {
        conf.jsfiles.forEach(function(file) {
            var filePath = path.normalize(file);
            filePath = self.basePath + '/' + filePath;
            // logger.debug(filePath);
        });
    }
};
ModuleClass.prototype.setDeps = function(deps) {
    logger.info('Depending:', this.name);
    this.deps = deps;
};
ModuleClass.prototype.setBasePath = function(path) {
    this.basePath = path;
};

Module.setConf = function(name, conf, buildCfgFile) {
    var mod = Module.getByName(name),
        file = File.getByName(buildCfgFile);
    mod.setConf(conf);
    file.builds(name);
    return mod;
};

Module.setBasePath = function(name, basePath) {
    var mod = Module.getByName(name);
    mod.setBasePath(basePath);
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
    var file = File.getByName(file);
    if (file) {
        file.changed();
        logger.info('Building:', file, action);
    }
};

module.exports = Module;
