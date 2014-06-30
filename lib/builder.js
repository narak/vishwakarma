
var File = require('./file'),
    util = require('./util'),
    fs = require('fs'),
    path = require('path');

var logger = require('./logger'),
    cfg = {};

exports.configure = function(config) {
    cfg = config;
    if (cfg.dependencyConfigFile) {
        cfg.dependencyConfigFile = cfg.dependencyConfigFile.replace('*', '.*');
        cfg.dependencyConfigFile = new RegExp('^' + cfg.dependencyConfigFile + '$');
    }
}

exports.prepare = function(files) {
    if (!(files instanceof Array)) {
        throw new Error('Module Prepare: Expecting an array but got something else instead.', files)
    }

    logger.out('Vishwakarma:', 'Found things to build...');
    util.forEach(files, function(filePath, i, done) {
        var file = File.register(filePath),
            basename = path.basename(filePath);

        if (cfg.moduleConfigFile === basename) {
            logger.debug('Updating builds from file:', filePath);
            file.updateBuilds(done);
        } else if (cfg.dependencyConfigFile.test(basename)) {
            logger.debug('Updating deps from file:', filePath);
            file.updateDeps(done);
        } else {
            done();
        }
    }).then(function() {
        logger.out('Vishwakarma:', 'Watching for changes...');
    });
};

exports.build = function(event, file) {
    var file = File.getByName(file);
    if (file) {
        file.changed();
    }
};
