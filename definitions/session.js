const COOKIE = '__session';
const TIMEOUT = '10 minutes';
const SESSION = {};

// We register a new middleware `session`
F.middleware('session', function(req, res, next, options, controller) {

    var cookie = req.cookie(COOKIE);
    var ip = req.ip.hash().toString();

    // A simple prevention for session hijacking
    if (cookie) {
        var arr = cookie.split('|');
        if (arr[1] !== ip)
            cookie = null;
    }

    if (!cookie) {
        cookie = U.GUID(15) + '|' + ip;

        // Writes cookie
        res.cookie(COOKIE, cookie);
    }

    var session = SESSION[cookie];
    if (session)
        req.session = session;
    else
        SESSION[cookie] = req.session = {};

    // Extends session timeout
    req.session.ticks = F.datetime;
    next();
});

// Clears expired sessions
F.on('service', function(counter) {

    // each 2 minutes
    if (counter % 2 !== 0)
        return;

    var ticks = F.datetime.add('-' + TIMEOUT);

    Object.keys(SESSION).forEach(function(key) {
        var session = SESSION[key];
        if (session.ticks < ticks)
            delete SESSION[key];
    });
});
