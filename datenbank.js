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
        String('Using database at: ' + dbPath).NOTICE();
        $.global.set('database', db);
    } else {
        String('UNABLE TO CONNECT TO DATABASE. ALL SERVICES WILL BE RETURNED WITH ERROR.').WARNING();
        $.global.set('database', null);
    };
};
if($.nodejs.fs.existsSync(dbPath))
    _.database.loadDatabase(dbPath, loadDb);
else
    _.database.createDatabase(dbPath, loadDb);


var IPCServer = $.net.IPC.server(socketPath);
String('IPC Server created at: ' + socketPath).NOTICE();


IPCServer.on('data', require('./site/__init__.js'));
IPCServer.on('error', function(err){
    try{
        String(err).ERROR();
    } catch(e){
    };
});

IPCServer.start();
