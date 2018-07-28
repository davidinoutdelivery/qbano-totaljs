var OrientDB = require('orientjs');
var dbname = "qbano";
var server = OrientDB({
    host:     'orientdb.mx.inoutdelivery.com',
    port:     2424,
    username: 'admin',
    password: 'inout2018%$',
    name:     dbname
 });
 
 var db = server.use({
    username: 'admin',
    password: 'inout2018%$',
    name:     dbname
 });

 F.database = function() {
    return db;
 };

 F.setDatabaseUser = function(username, password) {
    db = server.use({
        name:     dbname,
        username: username,
        password: password
     });
 };