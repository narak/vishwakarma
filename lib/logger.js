
var colors = require('colors'),
    logger = {},
    logLevel = {
        info: false,
        debug: false,
        warn: true,
        error: true,
        out: true
    },
    endWithColonRe = /.*:$/,
    log = function(type, args) {
        if (logLevel[type]) {
            args = Array.prototype.slice.call(args, 0);
            if (endWithColonRe.test(args[0])) {
                args[0] = args[0][type];
            } else {
                args.unshift(('[' + type.toUpperCase() + ']')[type]);
            }
            console.log.apply(this, args);
        }
    };

colors.setTheme({
    out: 'white',
    info: 'cyan',
    warn: 'orange',
    debug: 'green',
    error: 'red'
});

logger.logLevel = function(ll) {
    logger.info('Logging set to :', ll);
    if (ll === 'debug') {
        logLevel.debug = true;
        logLevel.info = true;
    } else if (ll === 'info') {
        logLevel.info = true;
    }
};

logger.info = function() {
    log('info', arguments);
}

logger.debug = function() {
    log('debug', arguments);
}

logger.warn = function() {
    log('warn', arguments);
}

logger.error = function() {
    log('error', arguments);
}

logger.out = function() {
    log('out', arguments);
}

module.exports = logger;
