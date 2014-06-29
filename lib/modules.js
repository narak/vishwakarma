
var File = require('./file'),
    fs = require('fs'),
    path = require('path'),
    Module = require('./module');

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
    var fileParsedCount = 0,
        decFileCount = function() {
            fileParsedCount--;
            if (fileParsedCount === 0) {
                fileParseDone();
            }
        },
        fileParseDone = function() {
            logger.out('Vishwakarma:', 'Watching for changes...');
        };

    files.forEach(function(filePath) {
        var file = File.register(filePath),
            basename = path.basename(filePath);

        if (cfg.moduleConfigFile === basename) {
            logger.debug('Updating builds from file:', filePath);
            fileParsedCount++;
            file.updateBuilds(decFileCount);
        } else if (cfg.dependencyConfigFile.test(basename)) {
            logger.debug('Updating deps from file:', filePath);
            fileParsedCount++;
            file.updateDeps(decFileCount);
        }
    });
};

exports.build = function(event, file) {
    var file = File.getByName(file);
    if (file) {
        file.changed();
    }
};
