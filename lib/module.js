
var path = require('path'),
    logger = require('./logger'),
    File = require('./file'),
    regedModules = {};

var ModuleClass = function(name) {
    this.name = name;
    logger.info('Registering:', this.name);

    this.jsfiles = [];
    this.prefiles = [];
    this.cssfiles = [];
    return this;
};

ModuleClass.prototype.setConf = function(conf) {
    logger.info('Set Configuration:', this.name);
    logger.debug(conf);
    var self = this;

    debugger;
    if (conf.prependfiles) {
        conf.prependfiles.forEach(function(prependFile) {
            var filepath = path.resolve(self.basePath, 'meta', prependFile),
                file = File.register(filepath);
            file.prependFor(self.name);
            self.prefiles.push(filepath);
        });
    }

    if (conf.jsfiles) {
        conf.jsfiles.forEach(function(jsFile) {
            var filepath = path.resolve(self.basePath, 'js', jsFile),
                file = File.register(filepath);
            file.partOf(self.name);
            self.jsfiles.push(filepath);
        });
    }

    if (conf.cssfiles) {
        conf.cssfiles.forEach(function(cssFile) {
            var filepath = path.resolve(self.basePath, 'css', cssFile),
                file = File.register(filepath);
            file.partOf(self.name);
            self.cssfiles.push(filepath);
        });
    }
};

ModuleClass.prototype.setDeps = function(deps) {
    logger.info('Set Dependencies:', this.name);
    logger.debug(deps);
    this.deps = deps;
};

ModuleClass.prototype.setBasePath = function(path) {
    logger.info('Set BasePath:', this.name);
    logger.debug(path);
    this.basePath = path;
};

exports.register = function(name) {
    var mod = regedModules[name];
    if (!mod) {
        regedModules[name] = mod = new ModuleClass(name);
    }
    return mod;
};

exports.getByName = function(name) {
    return regedModules[name];
};
