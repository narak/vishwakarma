
exports.forEach = function(arr, loopFn) {
    var thenns = [],
        results = [],
        size = arr.length;

    var execTheThenns = function() {
        thenns.forEach(function(fn) {
            fn(results);
        });
    };

    var further = function() {
        if (results.length === size) {
            execTheThenns();
        }
    };

    var done = function(i) {
        return function() {
            results.push(arguments);
            further();
        };
    };

    arr.forEach(function(d, i) {
        loopFn(d, i, done(i));
    });

    return {
        then: function(fn, ctx) {
            var nfn;
            if (ctx) {
                nfn = function() {
                    fn.call(ctx, arguments);
                };
            } else {
                nfn = fn;
            }
            thenns.push(nfn);
        }
    }
};
