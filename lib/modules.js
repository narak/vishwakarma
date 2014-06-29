
var File = require('./file'),
    fs = require('fs'),
    path = require('path'),
    Module = require('./module');

var logger = require('./logger'),
    props = {},
    cfg = {};

props.configure = function(config) {
    cfg = config;
    if (cfg.dependencyConfigFile) {
        cfg.dependencyConfigFile = cfg.dependencyConfigFile.replace('*', '.*');
        cfg.dependencyConfigFile = new RegExp('^' + cfg.dependencyConfigFile + '$');
    }
}

props.prepare = function(files) {
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

    files.forEach(function(file) {
        var basename = path.basename(file),
            dirname = path.dirname(file),
            ext = path.extname(file);

        if (cfg.moduleConfigFile === basename) {
            fileParsedCount++;
            props.parseModuleConfigFile(file, dirname, basename, ext, decFileCount);
        } else if (cfg.dependencyConfigFile.test(basename)) {
            fileParsedCount++;
            props.parseDependencyConfigFile(file, dirname, basename, ext, decFileCount);
        }
    });
};

props.parseModuleConfigFile = function(filePath, dirname, basename, ext, cb) {
    fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) {
            logger.error(err);
            return;
        }

        var file = File.register(filePath),
            parsed, builds, modName, mod;
        try {
            parsed = JSON.parse(data);
            builds = parsed.builds;
            for (var modName in builds) {
                file.builds(modName);
                mod = Module.register(modName);
                mod.setBasePath(dirname);
                mod.setConf(builds[modName], filePath);
            }
            cb();
        } catch (e) {
            logger.error('Error while trying to prepare filePath:', filePath);
            logger.error(e);
            logger.error(e.stack);
            process.exit(1);
        }
    });
};

props.parseDependencyConfigFile = function(filePath, dirname, basename, ext, cb) {
    fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) {
            logger.error(err);
            return;
        }

        var file = File.register(filePath),
            modules = [],
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
                file.depsFor(modName);
                mod = Module.register(modName);
                mod.setDeps(submodules[modName].requires);
            }
            cb();
        } catch (e) {
            logger.error('Error while trying to prepare filePath:', filePath);
            logger.error(e);
            logger.error(e.stack);
            process.exit(1);
        }
    });
};

props.build = function(event, file) {
    var file = File.getByName(file);
    if (file) {
        file.changed();
    }
};

module.exports = props;
