var router = [
    [/^\/identity\/query\/([0-9a-fA-F])+\/?$/,
                                            require('./identity.js'),   'DB',],
    [/^\/identity\/search\/keyword\/?$/,    require('./identity.js'),   'DB',],
    [/^\/codebook\/(add|edit|remove)\/?$/,  require('./codebook.js'),   'DB', 'AUTH', 'POST'],
    [/^\/codebook\/query\/([0-9a-fA-F]+)\/?$/,
                                            require('./codebook.js'),   'DB',],
    [/^\/?$/,                               require('./landmark.js'), ],
];

module.exports = function(packet){
    var workflow = [], result = null, routerRule = null, handler = null;
    var database = null;//$.global.get('database');

    for(var i in router){
        routerRule = router[i];
        result = routerRule[0].exec(packet.request.url);
        if(null != result) break;
    };

    if(null == result){
        packet.response.writeHead(400);
        packet.response.end();
        return;
    };

    handler = routerRule[1];
    routerRule = routerRule.slice(2);

    // check database
    if(routerRule.indexOf('DB') >= 0){
        workflow.push(function(callback){
            if(null == database)
                callback(503);
            else
                callback(null);
        });
    };

    // check auth
    if(routerRule.indexOf('AUTH') >= 0){
        workflow.push(function(callback){
            // XXX do something
            callback(401);
        });
    };

    function startWork(post){
        workflow.push(function(callback){
            handler(packet, result, post, callback);
        });
        $.nodejs.async.waterfall(workflow, function(err, result){
            if(null == err){
                packet.response.writeHead(200);
                packet.response.end(result);
            } else {
                packet.response.writeHead(err);
                packet.response.end();
            };
        });
    };

    // wait post data, if needed
    if(routerRule.indexOf('POST') >= 0){
        if(packet.method != 'post'){
            packet.response.writeHead(405);
            packet.response.end();
        } else {
            packet.on('ready', startWork);
        };
    } else {
        startWork(null);
    };
};
