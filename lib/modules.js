
var fs = require('fs'),
    path = require('path'),
    Module = require('./module');

var logger = require('./logger'),
    props = {},
    cfg = {};

props.configure = function(config) {
    cfg = config;
    if (cfg.dependencyConfigFile) {
        cfg.dependencyConfigFile = new RegExp('^' + cfg.dependencyConfigFile.replace('*', '.*') + '$')
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

props.parseModuleConfigFile = function(file, dirname, basename, ext, cb) {
    fs.readFile(file, 'utf8', function(err, data) {
        if (err) {
            logger.error(err);
            return;
        }

        var parsed, modules, module;
        try {
            parsed = JSON.parse(data);
            modules = parsed.builds;
            for (var module in modules) {
                Module.setBasePath(module, dirname);
                Module.setConf(module, modules[module], file);
            }
            cb();
        } catch (e) {
            logger.error('Error while trying to prepare file:', file);
            logger.error(e);
            logger.error(e.stack);
            process.exit(1);
        }
    });
};

props.parseDependencyConfigFile = function(file, dirname, basename, ext, cb) {
    fs.readFile(file, 'utf8', function(err, data) {
        if (err) {
            logger.error(err);
            return;
        }

        var parsed,
            modules = [];
        try {
            parsed = JSON.parse(data);
            for (var something in parsed) {
                for (var module in parsed[something].submodules) {
                    Module.setDeps(module, parsed[something].submodules[module].requires, file);
                }
            }
            cb();
        } catch (e) {
            logger.error('Error while trying to prepare file:', file);
            logger.error(e);
            logger.error(e.stack);
            process.exit(1);
        }
    });
};

props.build = function(event, file) {
    Module.build(file, event);
};

module.exports = props;
