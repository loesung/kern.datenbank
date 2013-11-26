/*
 * Database System
 *
 * This server listens on a UNIX socket. It provides all other servers on
 * this system with access to global options.
 */
require('./lib/baum.js');
require('./lib/_.js');

$.global.set('config', $.config.createConfig('./config/'));

var socketPath = $.global.get('config').get('socket-path');
var dbPath = $.global.get('config').get('database-path');

var IPCServer = $.net.IPC.server(socketPath);
console.log('IPC Server created at: ' + socketPath);

console.log('Using database at: ' + dbPath);

IPCServer.on('data', require('./site/__init__.js'));
IPCServer.on('error', function(err){
    try{
        console.log('ERROR! ' + err);
    } catch(e){
    };
});

IPCServer.start();
