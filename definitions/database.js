var OrientDB = require('orientjs');
var dbname = "qbano";
var server = OrientDB({
    host: 'orientdb.mx.inoutdelivery.com',
    port: 2424,
    username: 'social',
    password: 'social123',
    name: dbname
});

var db = server.use({
    name: dbname,
    username: 'social',
    password: 'social123'
});

F.database = function () {
    return db;
};

F.setDatabaseUser = function (username, password) {
    db = server.use({
        name: dbname,
        username: username,
        password: password
    });
};