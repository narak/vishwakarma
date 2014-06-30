
var path = require('path'),
    util = require('./util'),
    logger = require('./logger'),
    File = require('./file'),
    regedModules = {};

var Builder = (function() {
    var b = {},
        ready = false,
        _queue = [];

    var timer,
        resetTimer = function() {
            clearTimeout(timer);
            timer = setTimeout(function() {
                b.build();
            }, 2000);
        };

    b.queue = function(mod) {
        logger.info('Build queued, waiting to stabilize.');
        _queue.push(mod);
        resetTimer();
    };

    b.build = function() {
        var built = {};
        util.forEach(_queue, function(mod, i, done) {
            if (built[mod.name]) {
                done();
                return;
            }
            built[mod.name] = true;

            logger.out('Building:', mod.name);
            done();
        }).then(function() {
            _queue = [];
            logger.out('Vishwakarma:', 'All done!');
        });
    };
    return b;
})();

var ModuleClass = function(name) {
    this.name = name;
    logger.info('Registering:', this.name);

    this.jsfiles = [];
    this.prefiles = [];
    this.cssfiles = [];
    return this;
};

ModuleClass.prototype.config = function(conf) {
    logger.info('Set Configuration:', this.name);
    logger.debug(conf);
    var self = this;

    if (conf.prependfiles) {
        conf.prependfiles.forEach(function(prependFile) {
            var filepath = path.resolve(self.basepath, 'meta', prependFile),
                file = File.register(filepath);
            file.prependFor(self.name);
            self.prefiles.push(filepath);
        });
    }

    if (conf.jsfiles) {
        conf.jsfiles.forEach(function(jsFile) {
            var filepath = path.resolve(self.basepath, 'js', jsFile),
                file = File.register(filepath);
            file.partOf(self.name);
            self.jsfiles.push(filepath);
        });
    }

    if (conf.cssfiles) {
        conf.cssfiles.forEach(function(cssFile) {
            var filepath = path.resolve(self.basepath/*, 'css'*/, cssFile),
                file = File.register(filepath);
            file.partOf(self.name);
            self.cssfiles.push(filepath);
        });
    }
};

ModuleClass.prototype.dependencies = function(deps) {
    logger.info('Set Dependencies:', this.name);
    logger.debug(deps);
    this.deps = deps;
};

ModuleClass.prototype.modDir = function(path) {
    logger.info('Set Basepath:', this.name);
    logger.debug(path);
    this.basepath = path;
};

ModuleClass.prototype.build = function() {
    // logger.out('Building:', this.name);
    Builder.queue(this);
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

exports.getEachByName = function(nameArr, cb) {
    nameArr.forEach(function(modName) {
        cb(exports.getByName(modName));
    });
};

exports.build = function(nameArr) {
    exports.getEachByName(nameArr, function(mod) {
        mod && mod.build();
    });
};
