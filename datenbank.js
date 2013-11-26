/*
 * Database System
 *
 * This server listens on a UNIX socket. It provides all other servers on
 * this system with access to global options.
 */
require('./lib/baum.js');
require('./lib/_.js');

$.global.set('config', $.config.createConfig(
    $.nodejs.url.resolve(process.argv[1], './config/')
));

var socketPath = $.global.get('config').get('socket-path');
var dbPath = $.global.get('config').get('database-path');

// Init database.
function loadDb(err, db){
    if(null == err){
        console.log('Using database at: ' + dbPath);
        $.global.set('database', db);
    } else {
        console.log('WARNING: UNABLE TO CONNECT TO DATABASE. ALL SERVICES WILL BE RETURNED WITH ERROR.');
        $.global.set('database', null);
    };
};
if($.nodejs.fs.existsSync(dbPath))
    _.database.loadDatabase(dbPath, loadDb);
else
    _.database.createDatabase(dbPath, loadDb);


var IPCServer = $.net.IPC.server(socketPath);
console.log('IPC Server created at: ' + socketPath);


IPCServer.on('data', require('./site/__init__.js'));
IPCServer.on('error', function(err){
    try{
        console.log('ERROR! ' + err);
    } catch(e){
    };
});

IPCServer.start();
